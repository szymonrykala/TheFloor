import { useCallback, useMemo } from "react";
import type { GameAssociation, TGameBoard } from "../api/http.types";
import { useNavigate, useParams } from "react-router";
import { PlayerTile } from "./PlayerTile";
import toast from 'react-hot-toast';


type Props = {
    players: Array<GameAssociation>
    boardData: TGameBoard
    onSelect?: (player: GameAssociation) => void
    selectedId?: string
}

function defineDimensions(board: TGameBoard | undefined) {
    if (board && board[0]) {
        return { rows: board.length, columns: board[0].length }
    } else {
        return { columns: 3, rows: 3 }
    }
}

function buildPlayersMap(players: GameAssociation[]) {
    return players.reduce((acc, pl) => {
        return acc.set(pl.id, pl)
    }, new Map() as Map<string, GameAssociation>)
}


function determineNeighbors(board: TGameBoard, selectedId: string): string[] {
    const selectedCoordinates: [number, number][] = []

    board.forEach(
        (row, row_index) => row.forEach(
            (player_id, column_index) => player_id === selectedId && selectedCoordinates.push([row_index, column_index])
        )
    )
    const neighbors: (string | null)[] = []

    selectedCoordinates.forEach(([row, col]) => {
        neighbors.push(...[
            // up (row - 1, col)
            board[row - 1] ? board[row - 1][col] : null,
            // // down (row + 1, col)
            board[row + 1] ? board[row + 1][col] : null,
            // // left (row, col - 1)
            col > 0 ? board[row][col - 1] : null,
            // // right (row, col + 1)
            col < board[row].length - 1 ? board[row][col + 1] : null
        ])
    })

    return neighbors.filter(Boolean) as string[]
}


export function PlayersGameBoard({ players, onSelect, boardData, selectedId }: Props) {
    const { gameId } = useParams()
    const navigate = useNavigate()

    const boardDimensions = useMemo(() => defineDimensions(boardData), [boardData])
    const playersMap = useMemo(() => buildPlayersMap(players), [players, gameId])


    const gridStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateColumns: `repeat(${boardDimensions.columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${boardDimensions.rows}, minmax(0, 150px))`,
        gap: '8px',
        padding: '16px',
    }), [boardDimensions])


    const selectedNeighbors = useMemo(
        () => selectedId ? determineNeighbors(boardData, selectedId) : [],
        [boardData, selectedId]
    )


    const onTileClick = useCallback((player: GameAssociation) => {
        if (!selectedNeighbors.includes(player.id)) {
            toast.error("Wybierz gracza sąsiadującego")
            return
        }

        onSelect && onSelect(player)
        navigate("#clock")
    }, [onSelect, selectedNeighbors])


    const gridItems = useMemo(() => {
        return boardData?.map((row, row_index) => row.map((player_id, col_index) => {
            const player = playersMap.get(player_id || "")

            return <PlayerTile
                key={`${col_index}-${row_index}`}
                player={player}
                selected={Boolean(selectedId && player?.id === selectedId)}
                isNeighbor={selectedNeighbors.includes(player?.id || '')}
                onClick={onTileClick}
            />
        }))
    }, [boardData, onTileClick, playersMap, selectedNeighbors]);


    return (
        <section id="board">
            <div style={gridStyle}>{gridItems}</div>
        </section>
    );
}

