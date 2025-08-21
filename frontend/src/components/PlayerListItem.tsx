import { API_V1 } from "../api/const"
import type { GameAssociation } from "../api/http.types"
import { RemoveButton } from "./RemoveButton"
import { TableRow } from "./Table/TableRow"


type PlayerListItemProps = {
    index: number
    player: GameAssociation
    removeCallback?: () => void
}

export function PlayerListItem({ index, player, removeCallback }: PlayerListItemProps) {

    const handleRemove = async () => {
        const resp = await fetch(
            API_V1 + `/games/${player.game_id}/player/${player.id}`,
            { method: "DELETE" }
        )

        if (resp.ok && removeCallback) {
            removeCallback()
        }
    }

    return <TableRow className="group">
        <td>{index + 1}</td>
        <td>{player.player_name}</td>
        <td>{player.category_name}</td>
        <td className="text-center w-20">
            <div className="hidden group-hover:block">
                {
                    <RemoveButton title="Usuń gracza" disabled={!Boolean(removeCallback)} onClick={handleRemove} />
                }
            </div>
        </td>
    </TableRow>
}