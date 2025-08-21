import { useMemo, type ReactNode } from "react"


type Props = {
    children: ReactNode
    className?: string
    onClick?: () => void
}

const defaultStyles = "hover:bg-main/90 transition-colors \
[&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg odd:bg-main/20"


export function TableRow(props: Props) {

    const styles = useMemo(() => {
        return [
            props.className,
            defaultStyles,
            props.onClick && "hover:cursor-pointer"
        ].join(" ")
    }, [props.className, props.onClick])

    return <tr className={styles} onClick={props.onClick}>
        {props.children}
    </tr>
}