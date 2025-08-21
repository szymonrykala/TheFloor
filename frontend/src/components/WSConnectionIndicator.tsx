import { useContext } from "react"
import { AppContext } from "../context/AppContext"


export function WSConnectionIndicator() {
    const { wsState } = useContext(AppContext)

    if (wsState === undefined) {
        return <></>
    }

    return <div className="bottom-0 left-2" title="Status połączenia WS">
        <p className={`font-semibold ${wsState ? 'text-green-600' : 'text-red-500'}`}>
            ws
        </p>
    </div>
}