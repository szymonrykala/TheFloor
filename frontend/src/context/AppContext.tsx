import { createContext, useState, type ReactNode } from "react";


type TAppContextSate = {
    wsState?: boolean,
    suflerState?: boolean
}


type TAppContext = TAppContextSate & {
    setWsState: (value?: boolean) => void
    setSuflerState: (value?: boolean) => void
}

type TProps = {
    children: ReactNode
}

const defaultValue: TAppContext = {
    wsState: undefined,
    setWsState: () => null,

    suflerState: undefined,
    setSuflerState: () => null,
}

export const AppContext = createContext(defaultValue)

export function AppContextProvider(props: TProps) {
    const [ctx, setCtx] = useState<TAppContextSate>({
        wsState: undefined,
        suflerState: undefined
    })

    const setWsState = (state?: boolean) => setCtx(val => ({ ...val, wsState: state }))

    const setSuflerState = (state?: boolean) => setCtx(val => ({ ...val, suflerState: state }))


    return <AppContext value={{
        ...ctx,
        setWsState,
        setSuflerState
    }}>
        {props.children}
    </AppContext>
}