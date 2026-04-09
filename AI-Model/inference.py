import io
import torch
import numpy as np
import trimesh
from PIL import Image
import torchvision.transforms as T
from model_architecture import MultiModal3DModel
from pathlib import Path
import pymeshlab
import gdown
import os
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
    ms = pymeshlab.MeshSet()
    m = pymeshlab.Mesh(vertex_matrix=pc_pred.astype(np.float64))
    ms.add_mesh(m)
    ms.compute_normal_for_point_clouds(k=30, smoothiter=0)
    ms.generate_surface_reconstruction_screened_poisson(depth=8)
    ms.apply_coord_taubin_smoothing(stepsmoothnum=5, lambda_=0.9, mu=-0.53)
    ms.meshing_remove_duplicate_vertices()
    ms.meshing_remove_unreferenced_vertices()
    ms.meshing_remove_null_faces()
    final_mesh = ms.current_mesh()
    vertices = final_mesh.vertex_matrix()
    faces = final_mesh.face_matrix()
    vertex_normals = final_mesh.vertex_normal_matrix()
    tm_mesh = trimesh.Trimesh(vertices=vertices, faces=faces, vertex_normals=vertex_normals)
    glb_bytes = tm_mesh.export(file_type='glb')
    return glb_bytes