import type { BaseEvent, EventType } from "./events.types";


export function expectEvent<T>(type: EventType, event: BaseEvent, callback: (event: T) => void) {
    if (event.type === type) {
        callback(event as T)
    }
}


