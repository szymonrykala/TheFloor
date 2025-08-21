from sqlmodel import SQLModel, create_engine
from src.utils.filesystem import get_resources_path

engine = create_engine(f"sqlite:///{get_resources_path()}/database.db")
