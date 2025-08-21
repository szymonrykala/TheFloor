import json
from typing import List
import pytest
from sqlmodel import SQLModel, Session, create_engine

from src.controllers.board import initiate_board, create_current_board


@pytest.fixture(scope="function")
def db_engine():
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    with Session(db_engine) as session:
        yield session
        session.rollback()


def create_mock_game_associations(
    session: Session, count: int
) -> List:
    from src.database.models import GameAssociation

    players = []
    for i in range(count):
        player = GameAssociation(
            game_id="test_game",
            category_name="test_category",
            player_name=f"player_{i}",
            time_left=45,
            xy_points=json.dumps([]),
        )

        players.append(player)
    session.commit()

    return players


def test_board_initiation(db_session):
    from src.database.models import GameAssociation

    players_list: List[GameAssociation] = create_mock_game_associations(db_session, 5)

    board = initiate_board(players_list)
    recreated = create_current_board(players_list)

    print(board)
    print(recreated)

    del players_list
