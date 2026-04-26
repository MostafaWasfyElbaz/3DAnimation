from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from typing import List
import uvicorn
import io
import torch
import numpy as np
import open3d as o3d
from PIL import Image
import torchvision.transforms as T
from pathlib import Path
import trimesh
import torch.nn as nn
import torch.nn.functional as F
from pathlib import Path
import os
import gdown
file_segmentation_id = '1MyiP3ybdK5uKxkrPFrSkJtcmKWCBL5CA'
file_hybrid_id = '1WFLoikjO3takoPz7-W0-GmlbbTXsmvNV'
LATENT_DIM = 256
NUM_POINTS = 3072
parent_dir = Path(__file__).parent
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
NUM_VIEWS = 5
IMG_SIZE = (256, 256) 
model = None
model_path = parent_dir / "best_hybrid_pointcloud_model2.pth"
unet_path = parent_dir / "best_segmentation_model1.pth"
def knn_graph_torch(x, k=16):
    B, N, F = x.shape
    edge_indices = []
    for b in range(B):
        dists = torch.cdist(x[b], x[b])
        knn_idx = dists.topk(k=k+1, largest=False).indices[:, 1:]
        row = torch.arange(N, device=x.device).unsqueeze(1).repeat(1, k).flatten()
        col = knn_idx.flatten()
        edge_indices.append(torch.stack([row, col], dim=0))
        del dists
    return edge_indices
class DoubleConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )
    def forward(self, x):
        return self.net(x)
class UNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.down1 = DoubleConv(3, 64)
        self.down2 = DoubleConv(64, 128)
        self.down3 = DoubleConv(128, 256)
        self.pool = nn.MaxPool2d(2)
        self.middle = DoubleConv(256, 512)
        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.conv3 = DoubleConv(512, 256)
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.conv2 = DoubleConv(256, 128)
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.conv1 = DoubleConv(128, 64)
        self.out_mask = nn.Conv2d(64, 1, 1)
        self.out_depth = nn.Conv2d(64, 1, 1)
    def forward(self, x):
        d1 = self.down1(x)
        d2 = self.down2(self.pool(d1))
        d3 = self.down3(self.pool(d2))
        m = self.middle(self.pool(d3))
        u3 = self.up3(m)
        u3 = self.conv3(torch.cat([u3, d3], dim=1))
        u2 = self.up2(u3)
        u2 = self.conv2(torch.cat([u2, d2], dim=1))
        u1 = self.up1(u2)
        u1 = self.conv1(torch.cat([u1, d1], dim=1))
        mask_out = self.out_mask(u1)
        depth_out = self.out_depth(u1)
        return mask_out, depth_out
class MultiModalEncoder(nn.Module):
    def __init__(self, latent_dim=LATENT_DIM):
        super().__init__()
        in_ch = 5 
        self.conv_layers = nn.Sequential(
            nn.Conv2d(in_ch, 64, 3, stride=2, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.Conv2d(64, 128, 3, stride=2, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.Conv2d(128, 256, 3, stride=2, padding=1), nn.BatchNorm2d(256), nn.ReLU(),
            nn.Conv2d(256, 512, 3, stride=2, padding=1), nn.BatchNorm2d(512), nn.ReLU(),
        )
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Linear(512, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, latent_dim)
        )
    def forward(self, x):
        x = self.conv_layers(x)
        x = self.pool(x).view(x.size(0), -1)
        return self.fc(x)
class GNNBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.fc = nn.Linear(in_ch, out_ch)
        self.relu = nn.ReLU()
    def forward(self, x, edge_index):
        row, col = edge_index
        agg = torch.zeros_like(x)
        agg.index_add_(0, row, x[col])
        return self.relu(self.fc(x + agg))
class PointCloudDecoderGNN(nn.Module):
    def __init__(self, latent_dim=LATENT_DIM, hidden_dim=128, num_points=NUM_POINTS):
        super().__init__()
        self.num_points = num_points
        self.fc_latent = nn.Linear(latent_dim, num_points * hidden_dim)
        self.gnn1 = GNNBlock(hidden_dim, hidden_dim)
        self.gnn2 = GNNBlock(hidden_dim, hidden_dim)
        self.fc_out = nn.Linear(hidden_dim, 6)
    def forward(self, z):
        B = z.size(0)
        x = self.fc_latent(z).view(B, self.num_points, -1)
        with torch.no_grad():
            xyz_init = x[..., :3]
            edge_indices = knn_graph_torch(xyz_init.detach(), k=8)
        pcs = []
        for b in range(B):
            xb = x[b]
            edge_index = edge_indices[b]
            xb = self.gnn1(xb, edge_index)
            xb = self.gnn2(xb, edge_index)
            pcs.append(self.fc_out(xb))
        pcs = torch.stack(pcs, dim=0)
        xyz = pcs[:, :, :3]
        xyz = xyz - xyz.mean(dim=1, keepdim=True)
        scale = xyz.norm(dim=2).amax(dim=1, keepdim=True)
        xyz = xyz / (scale.unsqueeze(-1) + 1e-6)
        rgb = pcs[:, :, 3:] 
        return torch.cat([xyz, rgb], dim=-1)
class MultiModal3DModel(nn.Module):
    def __init__(self, trained_unet_path=unet_path, latent_dim=LATENT_DIM, num_points=NUM_POINTS):
        super().__init__()
        self.expert = UNet()
        checkpoint = torch.load(trained_unet_path, map_location='cpu', weights_only=True)
        self.expert.load_state_dict(checkpoint.get("model_state", checkpoint))
        self.expert.eval()
        for p in self.expert.parameters(): p.requires_grad = False
        self.encoder = MultiModalEncoder(latent_dim=latent_dim)
        self.decoder = PointCloudDecoderGNN(latent_dim=latent_dim, num_points=num_points)
    def forward(self, imgs):
        B, V, C, H, W = imgs.shape
        imgs_flat = imgs.view(B * V, C, H, W)
        with torch.no_grad():
            mask_pred, depth_pred = self.expert(imgs_flat)
        combined_inputs = torch.cat([imgs_flat, mask_pred, depth_pred], dim=1)
        latent_flat = self.encoder(combined_inputs)
        latent_agg = torch.max(latent_flat.view(B, V, -1), dim=1)[0]
        out = self.decoder(latent_agg) 
        pcs_xyz = out[:, :, :3]
        pcs_rgb = torch.sigmoid(out[:, :, 3:]) 
        return pcs_xyz, pcs_rgb
transform = T.Compose([
    T.Resize(IMG_SIZE),
    T.ToTensor(),
])
def init_model():
    global model
    model = MultiModal3DModel(trained_unet_path=unet_path, num_points=NUM_POINTS).to(DEVICE)
    checkpoint = torch.load(model_path, map_location=DEVICE, weights_only=True)
    model.load_state_dict(checkpoint)
    model.eval()
def add_colors_to_mesh(xyz, rgb, mesh):
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(xyz)
    pcd.colors = o3d.utility.Vector3dVector(rgb)
    pcd_tree = o3d.geometry.KDTreeFlann(pcd)
    mesh_colors = []
    for v in mesh.vertices:
        [_, idx, _] = pcd_tree.search_knn_vector_3d(v, 1)
        mesh_colors.append(pcd.colors[idx[0]])
    mesh.vertex_colors = o3d.utility.Vector3dVector(np.asarray(mesh_colors)) 
    return mesh
def load_input_images_memory(images_bytes_list):
    view_tensors = []
    for img_bytes in images_bytes_list:
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        view_tensors.append(transform(img))    
    imgs_batch = torch.stack(view_tensors).unsqueeze(0).to(DEVICE)
    return imgs_batch
def generate_3d_from_memory(images_bytes_list):
    imgs = load_input_images_memory(images_bytes_list)
    print("🧠 Generating Point Cloud (XYZ + RGB)...")
    with torch.no_grad():
        with torch.amp.autocast(device_type='cuda' if torch.cuda.is_available() else 'cpu'):
            pcs_xyz, pcs_rgb = model(imgs)
    xyz = pcs_xyz[0].cpu().numpy()
    rgb = pcs_rgb[0].cpu().numpy()
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(xyz)
    pcd.colors = o3d.utility.Vector3dVector(rgb)
    pcd, _ = pcd.remove_statistical_outlier(nb_neighbors=30, std_ratio=2.0)
    print("🛠️ Transforming Points to Mesh...")
    pcd.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=3, max_nn=30))
    pcd.orient_normals_towards_camera_location(pcd.get_center())
    mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pcd, depth=14)
    print("🎨 Mapping predicted colors to surface...")
    pcd_tree = o3d.geometry.KDTreeFlann(pcd)
    mesh_vertices = np.asarray(mesh.vertices)
    vertex_colors = []
    for v in mesh_vertices:
        [_, idx, _] = pcd_tree.search_knn_vector_3d(v, 1)
        vertex_colors.append(np.asarray(pcd.colors)[idx[0]])
    mesh.vertex_colors = o3d.utility.Vector3dVector(np.array(vertex_colors))
    densities = np.asarray(densities)
    density_threshold = np.quantile(densities, 0.000000000000000000000000000000000000000000000000000000000000000000001)
    mesh.remove_vertices_by_mask(densities < density_threshold)
    mesh.remove_duplicated_vertices()
    mesh.remove_degenerate_triangles()
    mesh.remove_duplicated_triangles()
    mesh.remove_non_manifold_edges()
    mesh = mesh.filter_smooth_laplacian(number_of_iterations=10, lambda_filter=1)
    mesh.compute_vertex_normals()
    mesh = add_colors_to_mesh(xyz, rgb, mesh)
    print("📦 Packing Mesh to GLB Bytes...")
    vertices = np.asarray(mesh.vertices)
    faces = np.asarray(mesh.triangles)
    v_colors = np.asarray(mesh.vertex_colors)
    if v_colors.dtype == np.float32 or v_colors.dtype == np.float64:
        v_colors = (np.clip(v_colors, 0.0, 1.0) * 255).astype(np.uint8)
    rgba_colors = np.ones((len(vertices), 4), dtype=np.uint8) * 255
    rgba_colors[:, :3] = v_colors
    tm_mesh = trimesh.Trimesh(vertices=vertices, faces=faces, vertex_colors=rgba_colors, process=False)
    glb_bytes = tm_mesh.export(file_type='glb')
    print("✅ Successfully generated GLB in memory!")
    return glb_bytes
def download_if_not_exists():
    if not os.path.exists(unet_path):
        print("Downloading UNet Model...")
        gdown.download(f'https://drive.google.com/uc?id={file_segmentation_id}', str(unet_path), quiet=False)
    if not os.path.exists(model_path):
        print("Downloading 3D Hybrid Model...")
        gdown.download(f'https://drive.google.com/uc?id={file_hybrid_id}', str(model_path), quiet=False)
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n" + "="*60)
    print("🚀 Starting Production Server...") 
    print("📥 Checking and downloading AI Model if needed...")
    download_if_not_exists()
    print("🧠 Loading AI Model into memory (This might take a moment)...")
    init_model()
    print("✅ Model Loaded Successfully!")
    print("-" * 60)
    print("🌍 Server is running and ready for API requests!")
    print("="*60 + "\n")
    yield  
    print("\n🛑 Shutting down API Server and cleaning up GPU/RAM...")
app = FastAPI(title="3D Mesh Generation API", lifespan=lifespan)
@app.post("/predict")
async def predict(images: List[UploadFile] = File(...)):
    if not ( len(images) == 5):
        raise HTTPException(status_code=400, detail="Must send exactly 5 images")
    try:
        images_bytes_list = [await img.read() for img in images]
        glb_bytes = generate_3d_from_memory(images_bytes_list)
        if not glb_bytes:
            raise HTTPException(status_code=500, detail="Failed to generate 3D mesh") 
        return Response(content=glb_bytes, media_type="model/gltf-binary")     
    except Exception as e:
        print(f"Error during inference: {e}") 
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)