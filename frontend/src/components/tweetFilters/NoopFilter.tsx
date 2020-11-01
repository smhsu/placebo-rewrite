import React, {useState} from "react";
import { ITweetFilter } from "./ITweetFilter";

export function NoopFilter({ onDataUpdated, originalData }: ITweetFilter) {
    const [isEvenClick, setIsEvenClick] = useState(false);
    const callback = () => {
        setIsEvenClick(!isEvenClick);
        onDataUpdated(originalData, {shouldFlip: !isEvenClick, shouldAnimate: true});
    }
    return <button onClick={callback}>Update Slider</button>
}