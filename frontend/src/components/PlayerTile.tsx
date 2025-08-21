import type { GameAssociation } from "../api/http.types"


type PlayerTileProps = {
    player?: GameAssociation
    onClick: (player: GameAssociation) => void
    selected?: boolean
    isNeighbor: boolean
}


export function PlayerTile({ player, onClick, selected, isNeighbor }: PlayerTileProps) {
    return <div
        onClick={player ? () => onClick(player) : undefined}
        className={
            `flex items-center justify-center cursor-pointer p-2 rounded-lg shadow-sm transition-all
            ${selected ? '!bg-accent/40 shadow-lg scale-101' : ''}  
            ${player ? 'hover:scale-97 bg-main' : 'bg-gray-200'}
            ${isNeighbor? '!bg-accent':''}
            `
        }
        >
        <div className="text-center">
            <p className={`font-semibold ${selected ? "text-2xl" : "text-xl"}`}>
                {player?.player_name}
            </p>
            <p className={`${isNeighbor ? "text-2xl font-bold" : "text-xl"}`}>
                {player?.category_name}
            </p>
        </div>

    </div>
}