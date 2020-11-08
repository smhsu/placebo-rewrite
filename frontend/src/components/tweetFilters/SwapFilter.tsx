import React, {useState} from "react";
import {ITweetFilter, RequestedRenderConfig} from "./ITweetFilter";

function swapFirstTwoElement<S>(data: S[]) {
    if (data.length <= 1) {
        throw RangeError('data too short');
    }
    const firstElement = data[0];
    data[0] = data[1];
    data[1] = firstElement;
    return data;
}

export function SwapFilter({ onUpdate, data }: ITweetFilter) {
    const [isEvenClick, setIsEvenClick] = useState(false);
    const callback = () => {
        setIsEvenClick(!isEvenClick);
        const config = new RequestedRenderConfig(data, true);
        if (!isEvenClick) {
            config.flattenedTweetTree = swapFirstTwoElement(config.flattenedTweetTree);
        }
        onUpdate(config);
    }
    return <button onClick={callback}>Swap tweets</button>
}