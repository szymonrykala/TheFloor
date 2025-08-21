import { NavLink, useParams } from "react-router"
import { useMemo } from "react"
import { useCategories, useGameDetails } from "../api/http"
import type { GameDetails } from "../api/http.types"
import { RemoveGameForm } from "../components/forms/RemoveGameForm"
import { AddPlayerForm } from "../components/forms/AddPlayerForm"
import { useWs } from "../api/ws/client"
import { API_WS_V1 } from "../api/const"
import { useSuflerPresence } from "../hooks/useSufler"
import { PlayerListItem } from "../components/PlayerListItem"
import Loading from "../components/Loading/Loading"
import { Table } from "../components/Table/table"


export function PlayerGameView() {
    const { gameId } = useParams()
    const { data: categories } = useCategories()
    const { data: game, refetch: refetchGameDetails } = useGameDetails(gameId)


    const unusedCategories = useMemo(() => {
        const usedCategories = game?.state?.map(pl => pl.category_name)
        return categories?.filter((cat) => !usedCategories?.includes(cat.name)) || []
    }, [categories, game?.state])


    const winner = useMemo(() => {
        if (!game?.finished) {
            return undefined
        }

        return game.state.find((pl) => pl.id === game.winner_id)
    }, [game])


    return !(game && categories) ? <Loading /> : (
        <section className="flex flex-col items-center justify-center gap-5">
            <h2>
                {game.name}
            </h2>

            {
                winner && game.finished &&
                <h3 className="text-3xl font-semibold">Zwyciężył {winner.player_name} 🧠</h3>
            }

            <div className="py-2">
                <p className="text-sm text-dark/50">informacje:</p>

                <div className="flex gap-3 items-center">
                    <div className="badge">
                        <NavLink to="./sufler" target="_blank">
                            sufler 🔗
                        </NavLink>
                    </div>

                    <div className="badge">
                        Gra {game.started ? "" : "nie"} rozpoczęta
                    </div>

                    <div>
                        <RemoveGameForm gameId={game.id} />
                    </div>
                </div>
            </div>

            <AddPlayerForm
                gameId={game.id}
                allowedCategories={unusedCategories.map(cat => cat.name)}
                onSuccess={refetchGameDetails}
            />

            <Table headers={["Id", "Gracz", "Kategoria", ""]}>
                {
                    game?.state.map((player, index) => <PlayerListItem
                        key={player.id}
                        player={player}
                        index={index}
                        removeCallback={game.finished || game.started ? undefined : refetchGameDetails}
                    />)
                }
            </Table>

            <div>
                <GameStarterForm game={game}/>
            </div>
        </section>
    )
}


function GameStarterForm({ game }: { game: GameDetails }) {
    const { isReady, event } = useWs(API_WS_V1 + `/games/${game.id}`)
    const { sufler } = useSuflerPresence(event, game.sufler_present)

    return <div className="flex flex-col items-center gap-3">
        {
            ((isReady && sufler) || game.finished) || <p className="p-3 rounded-lg bg-red-600/30">
                Czekamy na suflera, wyślij mu &nbsp;
                <NavLink to="./sufler" target="_blank" className="text-blue-500">ten link 🔗 </NavLink>
            </p>
        }

        {
            game.state.length < 2 && <p>Potrzebnych jest minimum trzech graczy</p>
        }

        <NavLink to="./board">
            <button className="button w-full max-w-40 md:max-w-50 h-12 text-lg" title={
                sufler ? "rozpocznij rozgrywkę" : "Czekamy na suflera"
            }
                disabled={!(sufler && isReady && game.state.length > 2) || game.finished}
            >START</button>
        </NavLink>
    </div>
}
