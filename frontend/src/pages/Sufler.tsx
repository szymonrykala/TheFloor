import { useParams } from "react-router"
import { useWs } from "../api/ws/client"
import { useEffect, useState } from "react"
import { API_WS_V1 } from "../api/const"
import { expectEvent } from "../api/ws/events"
import type { TQuestion } from "../api/http.types"
import type { IQuestionEvent } from "../api/ws/events.types"


export default function SuflerView() {
  const { gameId } = useParams<string>()

  const [sessionStarted, setSessionStarted] = useState(false)
  const [question, setQuestion] = useState<TQuestion>()

  // const [error, setError] = useState<string | undefined>(undefined)

  const { isReady, sendEvent, event } = useWs(API_WS_V1 + `/games/${gameId}`)


  const onAppClose = () => sendEvent({
    type: "SUFLER_LEAVING",
    payload: {}
  })

  const sendResponseOk = () => sendEvent({
    type: "PLAYER_RESPONSE_OK"
  })

  const sendResponsePass = () => sendEvent({
    type: "PLAYER_RESPONSE_PASS"
  })

  useEffect(() => {
    isReady && setTimeout(() => sendEvent({
      type: "I_AM_SUFLER",
      payload: {}
    }), 1000)

    window.addEventListener("beforeunload", onAppClose);

    return () => {
      window.removeEventListener("beforeunload", onAppClose)
    }
  }, [isReady])


  useEffect(() => {
    if (!event) return

    // expectEvent(
    //   "ERROR",
    //   event,
    //   () => setError("Jeden Sufler już się połączył")
    // )

    expectEvent<IQuestionEvent>("NEXT_QUESTION", event, (event) => {
      if (event.payload) setQuestion(event.payload)
    })

    expectEvent<IQuestionEvent>("CLOCK_SET", event, () => {
      setSessionStarted(true)
    })

    expectEvent<IQuestionEvent>("PLAYER_TIME_OUT", event, () => {
      setSessionStarted(false)
      setQuestion(undefined)
    })

  }, [event, event?.payload, setSessionStarted, setQuestion])


  return <div className="flex flex-col h-200 max-h-dvh justify-evenly relative">
    <p className={`${sessionStarted ? 'bg-green-600/50' : 'bg-red-600/50'} absolute top-2 left-2 py-2 px-3 rounded-2xl w-fit`}>Sesja pojedynku: {sessionStarted ? "✅" : "☑️"}</p>

    {/* {error && <SufferAlreadyConnectedView message={error} />} */}

    <h2 className="text-center text-5xl md:text-8xl py-5">{question?.answer || "<.....>"}</h2>

    <div className="flex flex-row max-h-1/2 h-100 w-full gap-3 md:gap-5">
      <button onClick={sendResponseOk} className={"bg-green-600/80 " + buttonStyle}>OK</button>
      <button onClick={sendResponsePass} className={"bg-orange-600/80 " + buttonStyle}>PASS</button>
    </div>

  </div>
}

const buttonStyle = "cursor-pointer basis-1/2 text-5xl md:text-8xl font-bold text-canvas rounded-xl shadow-2xl transition-transform active:scale-95"

// function SufferAlreadyConnectedView(props: { message: string }) {
//   return <div>
//     <p>
//       Nie udało się połączyć jako sufler.
//     </p>
//     <h2>{props.message}</h2>
//     <p>Połącz się jako zwykły gracz: <NavLink to="../board"></NavLink></p>
//   </div>
// }