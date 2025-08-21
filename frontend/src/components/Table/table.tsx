import type { ReactNode } from "react";


type Props = {
    headers: string[]
    children: ReactNode
}


export function Table(props: Props) {
    return <table className="table-auto w-full max-w-140">
        <thead>
            <tr>
                {
                    props.headers.map((header, index) => <th
                        key={index}
                        className="py-3 px-4 text-left font-semibold">
                        {header}
                    </th>
                    )
                }
            </tr>
        </thead>
        <tbody>
            {props.children}
        </tbody>
    </table>
}