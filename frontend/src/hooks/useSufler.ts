import { useContext, useEffect, useState } from "react";
import type { BaseEvent } from "../api/ws/events.types";
import { expectEvent } from "../api/ws/events";
import { AppContext } from "../context/AppContext";


export function useSuflerPresence(event: BaseEvent | undefined, suflerPresent?: boolean) {
    const { setSuflerState } = useContext(AppContext)
    const [sufler, setSufler] = useState<boolean | undefined>(suflerPresent)

    useEffect(() => {
        if (!event) return

        expectEvent(
            "SUFLER_CONNECTED",
            event,
            () => {
                setSufler(true)
                setSuflerState(true)
            }
        )

        expectEvent(
            "SUFLER_DISCONNECTED",
            event,
            () => {
                setSufler(false)
                setSuflerState(false)
            }
        )
    }, [event])

    useEffect(() => setSuflerState(sufler), [])

    return { sufler, setSufler }
}