from pathlib import Path


def get_root_folder() -> Path:
    return Path(__file__).parent.parent.parent


def get_resources_path() -> Path:
    return get_root_folder().parent / "resources"


def get_frontend_build_path() -> Path:
    return get_resources_path() / "dist"
