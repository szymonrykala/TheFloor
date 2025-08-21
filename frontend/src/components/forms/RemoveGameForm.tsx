import { useNavigate } from "react-router";
import { API_V1 } from "../../api/const";
import { RemoveButton } from "../RemoveButton";


type Props = {
    gameId: string
}

export function RemoveGameForm({ gameId }: Props) {
    let navigate = useNavigate();

    const deleteGame = async () => {
        const resp = await fetch(
            API_V1 + "/games/" + gameId,
            { method: "DELETE" }
        )

        if (resp.ok) {
            navigate("/")
        }
    }

    return <RemoveButton title="Usuń grę" onClick={deleteGame} />

}