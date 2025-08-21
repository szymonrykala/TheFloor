from http import HTTPStatus
from itertools import chain
from typing import Sequence
from fastapi import APIRouter
from fastapi.responses import FileResponse

from src.exceptions import HttpNotFoundException
from src.utils.filesystem import get_resources_path
from src.database.operations import save_categories, save_questions, read_categories
from src.database.models import Question, Category


categories = APIRouter(prefix="/categories", tags=["categories"])


@categories.get("/")
async def get_all_categories() -> Sequence[Category]:
    return read_categories()


@categories.get("/{category}/image/{name}", tags=["image"])
async def get_image(category: str, name: str):
    path = get_resources_path() / "categories" / category / name

    if not path.exists():
        raise HttpNotFoundException

    return FileResponse(path)


@categories.post("/reload", tags=["ops"])
def reload_categories():

    categories: list[Category] = []
    questions: list[Question] = []

    for category_path in (get_resources_path() / "categories").iterdir():
        description = "Brak opisu"

        if category_path.name.lower() in ['.ds_store']:
            continue

        if (category_path / "description.txt").exists():
            description = (category_path / "description.txt").read_text() or description

        categories.append(
            Category(name=category_path.name.capitalize(), description=description)
        )

        image_paths = chain(
            category_path.glob("*.jpg", case_sensitive=False),
            category_path.glob("*.jpeg", case_sensitive=False),
            category_path.glob("*.png", case_sensitive=False),
            category_path.glob("*.webp", case_sensitive=False),
        )

        for image in image_paths:
            questions.append(
                Question(
                    category_name=category_path.name.capitalize(),
                    image_path=image.name,
                    answer=image.stem,
                )
            )

    save_categories(categories)
    save_questions(questions)

    return HTTPStatus.NO_CONTENT
