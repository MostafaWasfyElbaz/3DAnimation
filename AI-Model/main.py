from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from typing import List
import uvicorn
import io
import torch
import numpy as np
import trimesh
from PIL import Image
import torchvision.transforms as T
from pathlib import Path
import open3d as o3d
import gdown
import os
import torch
import torch.nn as nn
import torch.nn.functional as F
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
        self.out = nn.Conv2d(64, 1, 1)
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
        return self.out(u1)
class MultiModalEncoder(nn.Module):
    def __init__(self, latent_dim=256): 
        super().__init__()
        in_ch = 4
        self.conv1 = nn.Sequential(nn.Conv2d(in_ch, 64, 3, stride=2, padding=1), nn.BatchNorm2d(64), nn.ReLU())
        self.conv2 = nn.Sequential(nn.Conv2d(64, 128, 3, stride=2, padding=1), nn.BatchNorm2d(128), nn.ReLU())
        self.conv3 = nn.Sequential(nn.Conv2d(128, 256, 3, stride=2, padding=1), nn.BatchNorm2d(256), nn.ReLU())
        self.conv4 = nn.Sequential(nn.Conv2d(256, 512, 3, stride=2, padding=1), nn.BatchNorm2d(512), nn.ReLU())
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Linear(512, 512),
            nn.ReLU(),
            nn.Linear(512, latent_dim)
        )
    def forward(self, img_masked, mask):
        x = torch.cat([img_masked, mask], dim=1)
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)
        x = self.pool(x).view(x.size(0), -1)
        return self.fc(x)
class GNNBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.fc = nn.Linear(in_ch, out_ch)
    def forward(self, x, edge_index):
        row, col = edge_index
        agg = torch.zeros_like(x)
        agg.index_add_(0, row, x[col])
        return F.relu(self.fc(x + agg))
class PointCloudDecoderGNN(nn.Module):
    def __init__(self, latent_dim=256, hidden_dim=256, num_points=3072):
        super().__init__()
        self.num_points = num_points
        self.fc_latent = nn.Linear(latent_dim, num_points * hidden_dim)
        self.gnn1 = GNNBlock(hidden_dim, hidden_dim)
        self.gnn2 = GNNBlock(hidden_dim, hidden_dim)
        self.gnn3 = GNNBlock(hidden_dim, hidden_dim)
        self.fc_out = nn.Linear(hidden_dim, 3)
    def forward(self, z):
        B = z.size(0)
        x = self.fc_latent(z).view(B, self.num_points, -1)
        pcs = []
        for b in range(B):
            xb = x[b]
            dists = torch.cdist(xb[..., :3], xb[..., :3])
            knn_idx = dists.topk(k=9, largest=False).indices[:, 1:]
            row = torch.arange(self.num_points, device=z.device).unsqueeze(1).repeat(1, 8).flatten()
            col = knn_idx.flatten()
            edge_index = torch.stack([row, col], dim=0)
            xb = self.gnn1(xb, edge_index); xb = self.gnn2(xb, edge_index); xb = self.gnn3(xb, edge_index)
            pcs.append(self.fc_out(xb))
        pcs = torch.stack(pcs, dim=0)
        return pcs
class MultiModal3DModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.segmenter = UNet()
        self.encoder = MultiModalEncoder(latent_dim=256)
        self.decoder = PointCloudDecoderGNN(latent_dim=256, hidden_dim=256, num_points=3072)
    def forward(self, img):
        mask = torch.sigmoid(self.segmenter(img))
        latent = self.encoder(img * mask, mask)
        return self.decoder(latent)
parent_dir = Path(__file__).parent
model_path = parent_dir / "best_pointcloud_model3.pth"
file_id = '10DM-GnUIGwzjuMzFU5KIfw5V9L76lXE2'
def download_if_not_exists():
    if not os.path.exists(model_path):
        print(f"Model not found. Downloading from Google Drive...")
        url = f'https://drive.google.com/uc?id={file_id}'
        gdown.download(url, str(model_path), quiet=False)
        print("Download complete!")
    else:
        print("Model already exists. Skipping download.")
model_path = parent_dir / "best_pointcloud_model3.pth"
device = "cuda" if torch.cuda.is_available() else "cpu"
IMG_SIZE = (256, 256)
img_tf = T.Compose([T.Resize(IMG_SIZE)])
_MODEL_INSTANCE = None
def load_images_from_memory(images_bytes_list: list) -> torch.Tensor:
    all_imgs = []
    for img_bytes in images_bytes_list:
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img = img_tf(img)
        img_tensor = torch.from_numpy(np.array(img)).permute(2, 0, 1).float() / 255.0
        all_imgs.append(img_tensor.unsqueeze(0))
    img_batch = torch.cat(all_imgs, dim=0)
    return img_batch.to(device)
def init_model(weights_path=parent_dir / "best_pointcloud_model3.pth"):
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is None:
        model = MultiModal3DModel().to(device)
        state = torch.load(weights_path, map_location=device, weights_only=True)
        model.load_state_dict(state)
        model.eval()
        _MODEL_INSTANCE = model
    return _MODEL_INSTANCE
def generate_3d_from_memory(images_bytes_list: list) -> bytes:
    if not images_bytes_list:
        raise ValueError("❌ لم يتم إرسال أي صور للموديل!")
    model = init_model()
    img_batch = load_images_from_memory(images_bytes_list)  
    with torch.no_grad():
        pcs_pred = model(img_batch)
        pc_pred = pcs_pred.mean(dim=0).cpu().numpy()
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(pc_pred.astype(np.float64))
    pcd, _ = pcd.remove_statistical_outlier(nb_neighbors=40, std_ratio=2.0)
    pcd.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))
    bbox = pcd.get_axis_aligned_bounding_box()
    max_dim = max(bbox.get_extent())
    alpha = max_dim * 0.41 
    mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape(pcd, alpha)
    mesh = mesh.subdivide_midpoint(number_of_iterations=5)
    mesh.remove_duplicated_vertices()
    mesh.remove_degenerate_triangles()
    mesh.remove_duplicated_triangles()
    mesh.remove_non_manifold_edges()
    mesh.compute_vertex_normals()
    vertices = np.asarray(mesh.vertices)
    faces = np.asarray(mesh.triangles)
    vertex_normals = np.asarray(mesh.vertex_normals)
    tm_mesh = trimesh.Trimesh(vertices=vertices, faces=faces, vertex_normals=vertex_normals)
    glb_bytes = tm_mesh.export(file_type='glb')
    return glb_bytes
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting API Server...") 
    print("Loading AI Model into memory...")
    init_model()
    yield  
    print("Shutting down API Server and cleaning up...")
app = FastAPI(title="3D Mesh Generation API", lifespan=lifespan)
@app.post("/predict")
async def predict(images: List[UploadFile] = File(...)):
    if not (3 <= len(images) <= 5):
        raise HTTPException(status_code=400, detail="Must send between 3 and 5 images")
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
    download_if_not_exists()
    uvicorn.run(app, host="0.0.0.0", port=8000)
