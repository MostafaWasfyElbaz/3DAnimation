from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from typing import List
import uvicorn
from inference import init_model, generate_3d_from_memory,download_if_not_exists
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
