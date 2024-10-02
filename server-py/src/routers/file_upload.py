from fastapi import APIRouter,HTTPException, UploadFile, File, status
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator, List
from urllib.parse import quote
from bson import ObjectId

from ..database import image_fs
router = APIRouter()

async def get_file_stream(file_id: ObjectId) -> AsyncGenerator[bytes, None]:
    grid_out = await image_fs.open_download_stream(file_id)
    while True:
        chunk = await grid_out.readchunk()
        if not chunk:
            break
        yield chunk

async def upload_files(files: List[UploadFile], allowed_content_types: List[str], fs_bucket: AsyncIOMotorGridFSBucket) -> List[str]:
    file_ids = []
    for file in files:
        if file.content_type not in allowed_content_types:
            raise HTTPException(status_code=400, detail=f"Invalid file type for file {file.filename}. Allowed file types are {', '.join(allowed_content_types)}.")
        
        file_id = await fs_bucket.upload_from_stream(file.filename, file.file)
        file_ids.append(str(file_id))
    return file_ids

@router.get("/images/{file_id}")
async def get_image(file_id: str):
    try:
        file_id = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file ID format")

    try:
        file = await image_fs.open_download_stream(file_id)
        return StreamingResponse(file, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"File not found: {str(e)}")

@router.post("/images/")
async def upload_images(image_files: List[UploadFile] = File(...)):
    try:
        allowed_content_types = ["image/png", "image/jpeg"]
        file_ids = []
        for image_file in image_files:
            if image_file.content_type not in allowed_content_types:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid file type: {image_file.content_type}. Allowed types are {', '.join(allowed_content_types)}"
                )
            
            file_content = await image_file.read()
            file_id = await image_fs.upload_from_stream(image_file.filename, file_content)
            file_ids.append(str(file_id))
        
        return {"image_file_ids": file_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload images: {str(e)}")

@router.get("/download_image/{file_id}")
async def download_image(file_id: str):
    try:
        # แปลง file_id จาก string เป็น ObjectId
        object_id = ObjectId(file_id)
        
        # ดึงไฟล์จาก MongoDB GridFS
        grid_out = await image_fs.open_download_stream(object_id)
        
        # ตรวจสอบว่าไฟล์มีอยู่หรือไม่
        if grid_out is None:
            raise HTTPException(status_code=404, detail="File not found")
        
        # เข้ารหัสชื่อไฟล์ใน Content-Disposition header
        filename = quote(grid_out.filename)
        content_disposition = f'attachment; filename*=UTF-8\'\'{filename}'
        
        # ส่งไฟล์กลับไปยังผู้ใช้เป็น StreamingResponse
        return StreamingResponse(
            get_file_stream(object_id), 
            media_type="application/octet-stream",
            headers={"Content-Disposition": content_disposition}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )