import { useCallback, useEffect, useState } from "react"
import { GiCrossedSwords, GiPerspectiveDiceSixFacesRandom, GiRevolt } from "react-icons/gi"
import { useNavigate, useParams } from "react-router"
import { API_WS_V1 } from "../api/const"
import { getRandomPlayer, useGameBoard, useGameDetails } from "../api/http"
import type { GameAssociation } from "../api/http.types"
import { useWs } from "../api/ws/client"
import { expectEvent } from "../api/ws/events"
import type { IClockSyncEvent, IGameFinishedEvent, IPlayersDuelEndEvent, IPlayerTimeoutEvent, IQuestionEvent } from "../api/ws/events.types"
import { PlayersGameBoard } from "../components/PlayersGameBoard"
import { useSuflerPresence } from "../hooks/useSufler"
import { QuestionsView } from "./QuestionsView"
import { FaRegFlag } from "react-icons/fa";
import toast from 'react-hot-toast';


function PlayerDuelSpec(props: { player?: GameAssociation, duelMode: boolean }) {
    return <div className="text-2xl">
        {props.player ? <>
            <p className={`py-2 transition-[font-size] duration-500 ${props.duelMode ? "" : "text-accent text-4xl"}`}>{props.player?.player_name}</p>
            <div className={`transition-[font-size] duration-500 ${props.duelMode ? "text-7xl text-accent" : "text-2xl"}`}>{props.player?.time_left}<span className="text-xl">sec</span></div>
        </> :
            <>
                <p>...</p>
                <div>...</div>
            </>
        }
    </div>
}


export function BoardView() {
    const { gameId } = useParams()
    const navigate = useNavigate()

    const { data: game, refetch: refetchGameDetails } = useGameDetails(gameId)
    const { data: board, refetch: refetchBoard } = useGameBoard(gameId)


    const { isReady, event, sendEvent } = useWs(API_WS_V1 + `/games/${gameId}`)
    useSuflerPresence(event, game?.sufler_present || false)


    const [duelMode, setDuelMode] = useState(false)

    const [mainPlayer, setMainPlayer] = useState<GameAssociation>()
    const [secondPlayer, setSecondPlayer] = useState<GameAssociation>()

    const [questionTargetPlayerId, setQuestionTargetPlayerId] = useState<string>("")


    const syncPlayersOnClock = (event: IClockSyncEvent) => {
        if (!mainPlayer || !secondPlayer) return

        event.payload.players.forEach(pl => {
            switch (pl.id) {
                case mainPlayer?.id:
                    setMainPlayer(player => ({ ...player!, time_left: pl.time_left }))
                    break

                case secondPlayer?.id:
                    setSecondPlayer(player => ({ ...player!, time_left: pl.time_left }))
                    break

                default:
                    console.error(`Unrecognized player_id ${pl.id} while clock sync`, event)
                    break
            }
        })
    }

    const toggleDuelMode = () => setDuelMode(val => !val)

    const handleDuelTimeout = () => toast.error("Wyznaczony czas Minął!", {
        duration: 5_000
    })

    const handleDuelEnd = useCallback((event: IPlayersDuelEndEvent) => {
        refetchGameDetails()
        refetchBoard()

        const winner = game?.state.find((pl) => pl?.id === event.payload.winner_id)

        setMainPlayer(winner)
        setSecondPlayer(undefined)
        setDuelMode(false)

        toast.success(`Gracz ${winner?.player_name} wygrał pojedynek`, { duration: 10_000 })

    }, [refetchGameDetails, refetchBoard, game?.state])


    const handleGameFinished = useCallback((event: IGameFinishedEvent) => {
        toast.success(`Gra zakończona! ${event.payload.winner.player_name} jest mistrzem!`, {
            duration: 10_000
        })
        navigate("../")
    }, [])


    const chooseRandomPlayer = useCallback(async () => {
        if (secondPlayer?.id) {
            toast.error("Przeciwnik został wybrany, nie możesz wylosować gracza")
            return
        }

        let i = 0
        let randomPlayer

        do {
            randomPlayer = await getRandomPlayer(gameId)
            if (randomPlayer) {
                setMainPlayer(randomPlayer)
            }
            i += 1
        } while (randomPlayer?.id === mainPlayer?.id && i < 2)
    }, [gameId, secondPlayer?.id, mainPlayer?.id])


    const selectSecondPlayer = useCallback((player: GameAssociation) => {
        if (mainPlayer?.id === player.id) {
            toast.error("Wybierz innego gracza")
            return
        }

        if (mainPlayer?.id === undefined) return

        setSecondPlayer(player)
    }, [mainPlayer?.id])


    const sendPlayersDuelSetupEvent = useCallback(() => {
        if (!secondPlayer || !mainPlayer) {
            toast.error("Wybierz graczy aby rozpocząć pojedynek")
            return
        }
        sendEvent({
            type: "PLAYERS_DUEL", payload: {
                category: secondPlayer.category_name,
                player_a: mainPlayer.id,
                player_b: secondPlayer.id
            }
        })
        setQuestionTargetPlayerId(mainPlayer.id)
    }, [sendEvent, setQuestionTargetPlayerId, secondPlayer, mainPlayer])


    useEffect(() => {
        if (!event) return

        expectEvent<IPlayerTimeoutEvent>("PLAYER_TIME_OUT", event, handleDuelTimeout)
        expectEvent<IPlayersDuelEndEvent>("PLAYERS_DUEL_END", event, handleDuelEnd)
        expectEvent<IClockSyncEvent>("CLOCK_TIK_TOK", event, syncPlayersOnClock)
        expectEvent<IGameFinishedEvent>("GAME_FINISHED", event, handleGameFinished)

        expectEvent<IQuestionEvent>("NEXT_QUESTION", event, (event) => {
            setQuestionTargetPlayerId(event.payload.player_id)
        })
    }, [event])


    return !(isReady && board && game) ? <p>Loading ...</p> :
        <div className="flex flex-col gap-2">

            <section id="clock" className="w-full px-4 py-6 flex flex-row items-stretch justify-between text-center bg-dark text-canvas shadow-2xl rounded-2xl h-50">
                <div className={`items-center rounded-xl flex justify-center basis-4/12 ${mainPlayer?.id === questionTargetPlayerId ? 'bg-accent/30' : ''}`}>
                    {
                        mainPlayer ?
                            <PlayerDuelSpec player={mainPlayer} duelMode={duelMode} /> :
                            <button className="cursor-pointer text-5xl text-accent hover:scale-110 hover:rotate-12 transition-transform">
                                <GiPerspectiveDiceSixFacesRandom onClick={chooseRandomPlayer} />
                            </button>
                    }
                </div>

                <div className="h-full basis-4/12 items-center flex flex-col justify-center">
                    <p className={`text-accent mb-2 text-7xl transition-transform duration-500 ${duelMode ? 'scale-50 -translate-y-5' : ''}`}>
                        Vs
                    </p>
                    <p className={`transition-[font-size] transition-transform duration-500 ${duelMode ? "text-4xl -translate-y-8" : "text-2xl"}`}>
                        {secondPlayer?.category_name || "kategoria"}
                    </p>
                </div>

                <div className={`items-center rounded-xl flex justify-center basis-4/12 ${secondPlayer?.id === questionTargetPlayerId ? 'bg-accent/30' : ''}`}>
                    <PlayerDuelSpec player={secondPlayer} duelMode={duelMode} />
                </div>
            </section>

            {
                duelMode ? <>
                    <div className="flex gap-2 place-content-center basis-1">
                        <button className={"accent-button group"} onClick={sendPlayersDuelSetupEvent}>
                            <GiRevolt /> Start
                        </button>

                        <button className="accent-button group" onClick={toggleDuelMode}>
                            <FaRegFlag /> Powrót
                        </button>
                    </div>
                    <QuestionsView event={event as IQuestionEvent} />
                </>
                    :
                    <div className="flex gap-3 place-content-center">
                        <button disabled={!(mainPlayer && secondPlayer)} className="accent-button group" onClick={toggleDuelMode}>
                            <GiCrossedSwords />
                            Rzuć wyzwanie!!
                        </button>
                        <button className="rounded-4xl bg-dark/90 p-2 cursor-pointer text-4xl text-accent hover:scale-110 hover:rotate-12 transition-transform">
                            <GiPerspectiveDiceSixFacesRandom onClick={chooseRandomPlayer} />
                        </button>
                    </div>
            }

            {
                duelMode || <div>
                    <PlayersGameBoard boardData={board || [[]]} players={game?.state || []} selectedId={mainPlayer?.id} onSelect={selectSecondPlayer} />
                </div>
            }
        </div>
}
