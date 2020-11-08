import {ITweetFilter, RequestedRenderConfig} from "./ITweetFilter";
import React, {useState} from "react";
import {shuffle} from "lodash";

function randomizeArray<S>(data: S[]) {
    return shuffle(data);
}

export function RandomizeFilter({ onUpdate, data }: ITweetFilter) {
    const [isEvenClick, setIsEvenClick] = useState(false);
    const callback = () => {
        setIsEvenClick(!isEvenClick);
        const config = new RequestedRenderConfig(data, true);
        config.flattenedTweetTree = randomizeArray(config.flattenedTweetTree);
        onUpdate(config);
    }
    return <button onClick={callback}>Randomize Filter</button>
}