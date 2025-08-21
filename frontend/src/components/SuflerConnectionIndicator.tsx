import { useContext } from "react"
import { AppContext } from "../context/AppContext"
import { GiPoliceOfficerHead } from "react-icons/gi";
import { NavLink } from "react-router";


function determineSuflerLink() {
    if (document.URL.includes("board")) {
        return document.URL.replace("board", "sufler")
    } else {
        return document.URL + "/sufler"
    }
}


export function SuflerConnectionIndicator() {
    const { suflerState } = useContext(AppContext)

    if (suflerState === undefined) {
        return <></>
    }

    return <div className="bottom-0 left-2" title="Status suflera">
        <NavLink
            relative="path"
            to={determineSuflerLink()}
            className={`text-2xl font-bold ${suflerState ? 'text-green-600' : 'text-red-500 animate-ping'}`}
        >
            <GiPoliceOfficerHead />
        </NavLink>
    </div>
}
