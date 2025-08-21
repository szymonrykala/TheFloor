

type Dates = {
    created_at: string
    updated_at: string
}

type XYPoint = {
    x: number
    y: number
}

export type Category = Dates & {
    name: string
    description: string
}

export type GameAssociation = Dates & {
    id: string
    game_id: string
    category_name: string
    player_name: string
    time_left: number
    xy_points: Array<XYPoint>
}

export type Game = Dates & {
    id: string
    name: string
    started: boolean
    finished: boolean
    winner_id: string | null
    sufler_present: boolean
}

export type GameDetails = Game & {
    state: GameAssociation[]
}

export type TGameBoard = Array<Array<string | null>>

export type TQuestion = Dates & {
    player_id: string
    category_name: string
    image_path: string
    answer: string
}