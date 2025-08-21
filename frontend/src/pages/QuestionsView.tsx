import { useEffect, useState } from "react";
import { expectEvent } from "../api/ws/events";
import type { TQuestion } from "../api/http.types";
import type { BaseEvent, IQuestionEvent } from "../api/ws/events.types";
import { getImageUrl } from "../api/http";

import placeholderImage from '../assets/plch-image.png'


type Props = {
    event: BaseEvent | null
}

export function QuestionsView({ event }: Props) {
    const [question, setQuestion] = useState<TQuestion>()
    const [showAnswer, setShowAnswer] = useState(false)

    useEffect(() => {
        if (!event) return

        expectEvent<IQuestionEvent>("NEXT_QUESTION", event, (event) => {
            if (event.payload) {
                setQuestion(event.payload)
                setShowAnswer(false)
            }
        })

        expectEvent<BaseEvent>("PLAYER_TIME_OUT", event, () => {
            setTimeout(() => setQuestion(undefined), 3000)
        })
        expectEvent<BaseEvent>("QUESTION_SKIPPED", event, () => setShowAnswer(true))

    }, [event, setQuestion, setShowAnswer])


    return <section className="animate-slidedown">

        <figure style={{ maxHeight: "70vh" }} className="relative h-400">

            {
                showAnswer && <div className="absolute top-0 left-0 h-full w-full text-canvas flex place-content-center bg-dark/70 rounded-2xl animate-appear">
                    <p className="text-8xl text-shadow-md font-bold mt-60 m-auto text-center">
                        {question?.answer}
                    </p>
                </div>
            }

            <img className="h-12/12 rounded-2xl shadow-xl shadow-dark/40 object-scale-down m-auto" src={getImageUrl(question) || placeholderImage} alt="" height={500} />
        </figure>
    </section>
}
