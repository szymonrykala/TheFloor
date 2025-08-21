import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { API_V1 } from "../../api/const";
import { IoIosAddCircle } from "react-icons/io";


type CreateGameInput = {
    name: string
}


export function CreateGameForm() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
    } = useForm<CreateGameInput>()

    const onSubmit: SubmitHandler<CreateGameInput> = async (data) => {
        const resp = await fetch(API_V1 + "/games", {
            method: "POST", body: JSON.stringify(data), headers: {
                "Content-Type": "application/json"
            }
        })

        if (resp.ok) {
            const gameId = await resp.json()
            navigate("/games/" + gameId)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex rounded-xl shadow-lg transition-shadow focus-within:shadow-xl focus-within:shadow-dark/20">
            <input
                className={"input font-semibold max-w-100 w-dvw rounded-r-none focus:outline-none peer"}
                type="text"
                placeholder="Nazwa pokoju" {...register('name')}
                required
                minLength={3}
                maxLength={20}
            />
            <button className={"bg-dark text-accent/70 cursor-pointer text-4xl px-3 rounded-r-xl shadow-lg peer-focus:text-accent peer-focus:hover:bg-dark/90"} type="submit">
                <IoIosAddCircle />
            </button>
        </form>
    )
}