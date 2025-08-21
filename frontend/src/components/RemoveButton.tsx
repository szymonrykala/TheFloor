import { FaRegTrashAlt } from "react-icons/fa";


type Props = {
    onClick: () => void
    title?: string
    disabled?: boolean
}

export function RemoveButton({ onClick, title, disabled = false }: Props) {
    return <button
        title={title || "Usuń"}
        disabled={disabled}
        onClick={onClick}
        className="cursor-pointer text-lg text-red-600 rounded-4xl p-3 hover:bg-red-600/20 transition-colors disabled:text-gray-400 disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
        <FaRegTrashAlt />
    </button>
}