import type { GameAssociation, TQuestion as TQuestion } from "../http.types"


export type EventType =
    "I_AM_SUFLER" |
    "SUFLER_DISCONNECTED" |
    "SUFLER_CONNECTED" |
    "SUFLER_LEAVING" |

    "NEXT_QUESTION" |
    "QUESTION_SKIPPED" |

    "CLOCK_SET" |
    "CLOCK_TIK_TOK" |

    "PLAYERS_DUEL" |
    "PLAYERS_DUEL_END" |

    "PLAYER_RESPONSE_OK" |
    "PLAYER_RESPONSE_PASS" |
    "PLAYER_TIME_OUT" |

    "GAME_FINISHED" |

    "PING" |
    "ERROR"


export interface BaseEvent {
    type: EventType
    payload?: {}
}

export interface IQuestionEvent extends BaseEvent {
    type: "NEXT_QUESTION"
    payload: TQuestion
}

export interface IPlayerTimeoutEvent extends BaseEvent {
    type: "PLAYER_TIME_OUT"
    payload: {
        player_id: string
    }
}

export interface IPlayersDuelEndEvent extends BaseEvent {
    type: "PLAYERS_DUEL_END"
    payload: {
        winner_id: string
        looser_id: string
    }
}

export interface IClockSyncEvent extends BaseEvent {
    type: "CLOCK_TIK_TOK",
    payload: {
        players: Array<{ id: string, time_left: number }>
    }
}

export interface IGameFinishedEvent extends BaseEvent {
    type: "GAME_FINISHED",
    payload: {
        winner: GameAssociation
    }
}

// export type SuflerConnectedEvent = BaseEvent & {
//     type: "BROADCAST.SUFLER_CONNECTED"
// }
