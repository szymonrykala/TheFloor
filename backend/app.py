from contextlib import asynccontextmanager
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel
from src.utils.filesystem import get_frontend_build_path, get_root_folder
from src.database.engine import engine
from src.routes import ws, categories, game, views


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)

    yield


app = FastAPI(
    title="The Floor", lifespan=lifespan, servers=[{"url": "http://127.0.0.1:8000"}]
)

api_v1 = APIRouter(prefix="/api/v1")

api_v1.include_router(game)
api_v1.include_router(categories)
api_v1.include_router(ws)

app.include_router(views)
app.include_router(api_v1)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://0.0.0.0:80",
    "http://szymon.local:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_root = get_frontend_build_path() / "assets"
app.mount("/assets", StaticFiles(directory=static_root), name="assets")


@app.get("/")
def regirect_to_app():
    return RedirectResponse(views.prefix)
