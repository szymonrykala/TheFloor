from http import HTTPStatus
import json
from typing import Sequence
from fastapi import APIRouter, Response
from src.controllers.board import create_current_board, initiate_board
from src.exceptions import HttpForbiddenException, HttpNotFoundException
from src.utils.randomization import randomize_player
from src.database.models import Game, GameAssociation, GameDetails
from src.requests.game import RCreateGame, RCreatePlayerAssociation
from src.database.operations import (
    create_game_association,
    create_game_item,
    delete_whole_game,
    read_game,
    read_game_associations,
    read_games,
    read_game_details,
    remove_game_association,
    update_model,
)

game = APIRouter(prefix="/games", tags=["game"])


@game.post("/")
def create_game(data: RCreateGame):
    game_id = create_game_item(data.name)
    return Response(content=json.dumps(game_id), status_code=HTTPStatus.CREATED)


@game.get("/")
def get_games() -> Sequence[Game]:
    games = read_games()
    return games


@game.get("/{game_id}")
def get_game_details(game_id: str) -> GameDetails:
    return read_game_details(game_id)


@game.delete("/{game_id}")
def delete_game_by_id(game_id: str):
    delete_whole_game(game_id)
    return HTTPStatus.OK


@game.get("/{game_id}/random-player")
def get_random_player(game_id: str) -> GameAssociation:
    players = read_game_associations(game_id)

    if not players:
        raise HttpNotFoundException

    not_loosed_players = filter(lambda pl: len(pl.get_points()), players)

    return randomize_player(list(not_loosed_players))


@game.post("/{game_id}/player", response_description="'id' of the game associations")
def create_game_player(game_id: str, data: RCreatePlayerAssociation):
    #
    # TODO: validation if category and player_name has been choosed already
    #
    game = read_game_details(game_id)

    if game.started:
        raise HttpForbiddenException("Gra już się rozpoczęła!")

    if any(tuple(pl.category_name == data.category_name for pl in game.state)):
        raise HttpForbiddenException("Ta Kategoria jest zajęta - wybierz inną!")

    id = create_game_association(game_id, data)
    return Response(content=json.dumps(id), status_code=HTTPStatus.CREATED)


@game.delete("/{game_id}/player/{player_id}")
def remove_game_player(game_id: str, player_id: str):
    remove_game_association(game_id, player_id)
    return Response(status_code=HTTPStatus.NO_CONTENT)


@game.get("/{game_id}/board")
def get_game_board(game_id: str):
    game = read_game(game_id)
    players = read_game_associations(game_id)

    if not (game and players):
        raise HttpNotFoundException

    if not game.started:
        board = initiate_board(players)
        game.started = True
        update_model(game)
        return board

    return create_current_board(players)
