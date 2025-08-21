import { useGames } from "../api/http"
import { useNavigate } from "react-router";
import { CreateGameForm } from "../components/forms/CreateGameForm";
import { CategoriesReloadButton } from "../components/CategoriesReloader";
import type { Game } from "../api/http.types";
import { Table } from "../components/Table/table";
import { TableRow } from "../components/Table/TableRow";


export function HomeView() {
    const games = useGames()

    return (<section className="flex flex-col items-center gap-10">
        <div className="text-center">
            <h2>
                The Floor
            </h2>
            <p>Gra na wzór teleturnieju "The Floor"</p>
        </div>

        <div className="flex flex-col items-stretch gap-y-5 mt-5">

            <div className="text-center">
                <p className="mb-5 text-xl">Stwórz nowy pokój 😎</p>
                <CreateGameForm />
            </div>

            <Table headers={["Id", "Pokój", "Status"]}>
                {
                    games.data?.map((game, index) => <GameItem index={index} key={game.id} game={game} />)
                }
            </Table>
        </div>

        <div className="absolute bottom-0 left-0">
            <CategoriesReloadButton />
        </div>
    </section>)
}

function GameItem({ game, index }: { index: number, game: Game }) {
    const navigate = useNavigate()

    const determineStatus = (game: Game) => {
        if (game.started) {
            if (game.finished) {
                return "✅"
            } else {
                return "🔄"
            }
        } else {
            return "🧠"
        }
    }

    return <TableRow onClick={() => navigate(`/games/${game.id}`)}>
        <td>
            {index + 1}
        </td>
        <td>
            {game.name}
        </td>
        <td>
            {determineStatus(game)}
        </td>
        {/* <td>
            <NavLink to={`/games/${game.id}`}>
                <button className="button">
                    {
                        game.started ? "Podejrzyj" : "Zagraj"
                    }
                </button>
            </NavLink>
        </td> */}
    </TableRow>
}