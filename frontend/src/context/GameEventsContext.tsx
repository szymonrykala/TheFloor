import { createContext, type ReactNode } from "react"
import type { BaseEvent } from "../api/ws/events.types"
import { useWs } from "../api/ws/client"
import { API_WS_V1 } from "../api/const"

type TEventsContext = {
    event: BaseEvent | undefined
    isReady: boolean
    sendEvent: (event: BaseEvent) => void
}

type TProps = {
    gameId: string,
    children: ReactNode
}

const defaultValue: TEventsContext = {
    event: undefined,
    isReady: false,
    sendEvent: () => { }
}

export const GameEventsContext = createContext(defaultValue)


export function GameEventsContextProvider(props: TProps) {
    const { isReady, event, sendEvent } = useWs(API_WS_V1 + `/games/${props.gameId}`)

    return <GameEventsContext value={{
        event, sendEvent, isReady
    }}>
        {props.children}
    </GameEventsContext>
}