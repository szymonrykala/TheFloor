import os
from fastapi import APIRouter
from fastapi.responses import FileResponse

from src.utils.filesystem import get_frontend_build_path

views = APIRouter(prefix="/app")


@views.get("/{full_path:path}")
async def index(full_path: str):
    dist = get_frontend_build_path()
    file_path = dist / full_path

    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)

    return FileResponse(dist / "index.html")
