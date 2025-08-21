import { useForm, type SubmitHandler } from "react-hook-form"
import { API_V1 } from "../../api/const"
import { MdOutlinePersonAdd } from "react-icons/md";
import Select from 'react-select'
import { useMemo, useRef } from "react";
import toast from 'react-hot-toast';


type AddPlayerInput = {
    player_name: string
    category_name: string
}

type AddPlayerFormProps = {
    gameId: string
    allowedCategories: string[]
    onSuccess: () => void
}

export function AddPlayerForm({ gameId, allowedCategories, onSuccess }: AddPlayerFormProps) {
    const { handleSubmit, register, reset } = useForm<AddPlayerInput>({})

    const select = useRef<any | null>(null)

    const onSubmit: SubmitHandler<AddPlayerInput> = async (data) => {

        if (select.current && select.current.getValue().length) {
            data.category_name = select.current.getValue()[0].value
        } else {
            toast.error("Nie wybrano kategorii")
        }

        if (data.player_name.length < 3) {
            toast.error("Nazwa gracza musi być dłuższa")
            return
        }

        const resp = await fetch(API_V1 + "/games/" + gameId + "/player", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })

        switch (resp.status) {
            case 403:
                const data = await resp.json()
                toast.error(data.detail)
                break;

            case 201:
                console.log(select.current)
                select.current.clearValue()
                reset()
                onSuccess()
                break;
        }
    }

    const selectOptions = useMemo(
        () => allowedCategories.map(category => ({ value: category, label: category })),
        [allowedCategories]
    )

    return <form onSubmit={handleSubmit(onSubmit)} className="">

        <div className="flex transition-shadow duration-200 shadow-md focus-within:shadow-xl focus-within:shadow-dark/30 rounded-xl">

            <div className="flex flex-col justify-stretch items-stretch">
                <input className="focus:outline-none bg-dark text-canvas rounded-tl-xl w-100 h-15  text-xl font-semibold text-center"
                    type="text"
                    placeholder="nick gracza" {...register("player_name")}
                    minLength={3}
                    maxLength={20}
                    required
                />
                <Select
                    ref={select}
                    options={selectOptions}
                    placeholder="Wybierz kategorię ..."
                    className="focus:outline-none bg-dark text-center rounded-bl-xl"
                    styles={selectStylesConfig}
                />
            </div>

            <button className="bg-dark px-5 cursor-pointer hover:bg-dark/90 text-3xl text-accent peer-focus:bg-red-200 w-full rounded-r-xl" type="submit">
                <MdOutlinePersonAdd />
            </button>
        </div>
    </form>
}

const selectStylesConfig = {
    control: (styles: any) => ({
        ...styles,
        backgroundColor: "var(--color-dark)",
        color: "white",
        border: 'none',
        outline: "none"
    }),
    option: (styles: { [x: string]: any; }, { isSelected }: any) => ({
        ...styles,
        backgroundColor: isSelected ? "var(--color-canvas)" : 'white',
        color: "var(--color-dark)",

        ':active': {
            ...styles[":active"],
            backgroundColor: "var(--color-canvas)",
        },
        ':hover': {
            ...styles[":hover"],
            backgroundColor: "var(--color-canvas)",
        }
    }),
    singleValue: (styles: any) => ({
        ...styles,
        color: 'var(--color-canvas)',
    })
}