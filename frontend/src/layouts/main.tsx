import { NavLink, Outlet, useNavigate } from "react-router";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaHome } from "react-icons/fa";
import { WSConnectionIndicator } from "../components/WSConnectionIndicator";
import { IoMdArrowBack } from "react-icons/io";
import { SuflerConnectionIndicator } from "../components/SuflerConnectionIndicator";


export function MainLayout() {
    const navigate = useNavigate()

    return <div className="bg-back min-h-dvh flex flex-col justify-stretch items-stretch">

        <header className="bg-dark p-3 text-canvas drop-shadow-sm">
            <div className="flex items-center justify-between gap-2 max-w-280 m-auto">
                <div className="flex gap-2">
                    <WSConnectionIndicator />
                    <SuflerConnectionIndicator />
                </div>

                <h1 className="font-semibold text-center">
                    <LuLayoutDashboard className="text-2xl rotate-12 stroke-accent inline" /> {document.title}
                </h1>

                <nav className="flex gap-4">
                    <span className="cursor-pointer" onClick={() => navigate(-1)}><IoMdArrowBack className="text-2xl text-accent" /></span>
                    <NavLink to="/" title="Strona główna"><FaHome className=" text-2xl text-accent" /></NavLink>
                </nav>
            </div>
        </header>

        <main className="self-center bg-canvas rounded-xl flex-grow shadow-xl m-3 p-4 max-w-280 w-full relative">
            <Outlet />
        </main>

        <footer className="bg-dark text-main p-3">
            <p className="text-center">
                &copy; 2025 Szymon Rykała & Dominika Buler
            </p>
        </footer>
    </div>
}
