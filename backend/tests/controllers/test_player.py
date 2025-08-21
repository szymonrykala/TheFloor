# from typing import List
# import pytest

# from src.controllers import Player
# from src.database.models import GameAssociation


# @pytest.fixture
# def make_player():
#     def _make_player(xy_points: List[dict]) -> Player:
#         assoc = GameAssociation(xy_points)
#         return Player(assoc)

#     return _make_player


# @pytest.mark.parametrize(
#     "points1, points2, expected_eq, expected_lt, expected_gt, expected_le, expected_ge",
#     [
#         # Equal length
#         ([{"x": 1, "y": 2}], [{"x": 3, "y": 4}], True, False, False, True, True),
#         # Different lengths
#         (
#             [{"x": 1, "y": 2}],
#             [{"x": 3, "y": 4}, {"x": 5, "y": 6}],
#             False,
#             True,
#             False,
#             True,
#             False,
#         ),
#         # Empty vs non-empty
#         ([], [{"x": 1, "y": 2}], False, True, False, True, False),
#         # Both empty
#         ([], [], True, False, False, True, True),
#         # Longer vs shorter
#         (
#             [{"x": 1, "y": 2}, {"x": 3, "y": 4}, {"x": 5, "y": 6}],
#             [{"x": 7, "y": 8}],
#             False,
#             False,
#             True,
#             False,
#             True,
#         ),
#     ],
#     ids=[
#         "equal_length",
#         "shorter_vs_longer",
#         "empty_vs_nonempty",
#         "both_empty",
#         "longer_vs_shorter",
#     ],
# )
# def test_player_comparisons(
#     make_player,
#     points1,
#     points2,
#     expected_eq,
#     expected_lt,
#     expected_gt,
#     expected_le,
#     expected_ge,
# ):
#     player1 = make_player(points1)
#     player2 = make_player(points2)

#     # Test equality
#     assert (player1 == player2) == expected_eq
#     assert (player1 != player2) == (not expected_eq)

#     # Test less than
#     assert (player1 < player2) == expected_lt

#     # Test greater than
#     assert (player1 > player2) == expected_gt

#     # Test less than or equal
#     assert (player1 <= player2) == expected_le

#     # Test greater than or equal
#     assert (player1 >= player2) == expected_ge
