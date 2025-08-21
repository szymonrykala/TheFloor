import { useContext, useEffect, useRef, useState } from "react"
import type { BaseEvent } from "./events.types"
import { AppContext } from "../../context/AppContext"


interface WebSocketHook {
    isReady: boolean
    event: BaseEvent | undefined
    sendEvent: (event: BaseEvent) => void
    error: string | undefined
}

export const useWs = (url: string): WebSocketHook => {
    const [isReady, setIsReady] = useState<boolean>(false)
    const [event, setEvent] = useState<BaseEvent>()
    const [error, setError] = useState<string>()

    const { setWsState } = useContext(AppContext)

    const ws = useRef<WebSocket | null>(null)
    const eventsQueue = useRef<BaseEvent[]>([])


    const connect = () => {
        const socket = new WebSocket(url)

        socket.onopen = () => {
            setIsReady(true)
            setWsState(true)
            setError(undefined)
            console.log("WebSocket connected")
        }

        socket.onmessage = (event) => {
            try {
                const data: BaseEvent = JSON.parse(event.data)
                eventsQueue.current.push(data)

            } catch (err) {
                setError("Failed to parse WebSocket message")
                console.error("WebSocket message parse error:", err)
            }
        }

        socket.onerror = (err) => {
            setError("WebSocket error occurred")
            console.error("WebSocket error:", err)
            setIsReady(false)
            setWsState(false)
        }

        socket.onclose = () => {
            setIsReady(false)
            setWsState(false)
            setError("WebSocket connection closed")
            console.log("WebSocket disconnected")
        }

        ws.current = socket
    }


    const reconnect = () => {
        if (ws.current?.readyState === WebSocket.CLOSED) {
            console.log("Attempting to reconnect...")
            connect()
        }
    }


    const sendEvent = (event: BaseEvent) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(event))
        } else {
            setError("WebSocket is not connected")
            setWsState(false)
            console.error("Cannot send event: WebSocket is not connected")
        }
    }


    const processQueue = () => {
        if (eventsQueue.current.length > 0) {
            const nextEvent = eventsQueue.current.shift()! // first element in the queue
            setEvent(nextEvent)
        }
    }

    const pingConnection = () => sendEvent({ type: "PING" })
    

    // WebSocket initialization
    useEffect(() => {
        if (isReady === false) {
            connect()
        }

        const processingInterval = setInterval(processQueue, 100)
        const interval = setInterval(pingConnection, 30_000)
        const reconnectInterval = setInterval(reconnect, 5_000)

        return () => {
            clearInterval(interval)
            clearInterval(processingInterval)
            clearInterval(reconnectInterval)
        }
    }, [connect, isReady, processQueue, pingConnection, reconnect])

    return {
        isReady,
        event,
        sendEvent,
        error,
    }
}
