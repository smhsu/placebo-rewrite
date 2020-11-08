import React, {useState} from "react";
import { Slider } from "@material-ui/core";
import { flatten } from "lodash";

import {ITweetFilter, RequestedRenderConfig} from "./ITweetFilter";
import { SliderContainer } from "./SliderContainer";
import { TweetPopularityCalculator } from "../../TweetPopularityCalculator";

const NUM_SLIDER_STOPS = 9;
const POPULARITY_CALCULATOR = new TweetPopularityCalculator();

export function RangePopularityFilter({ data, onUpdate }: ITweetFilter) {
    const [state, setState] = useState([1, NUM_SLIDER_STOPS]);

    const onChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
        let newState: [number, number];
        if (typeof value === "number") {
            newState = [value, value];
        } else {
            newState = value as [number, number];
        }
        setState(newState);
        const chunks = POPULARITY_CALCULATOR.sortAndChunk(data, NUM_SLIDER_STOPS);
        const tweets = flatten(chunks.slice(newState[0] - 1, newState[1]));
        onUpdate(new RequestedRenderConfig(tweets));
    };

    return <SliderContainer
        mainLabel="Popularity range"
        instructions="Move the circles to customize Tweets. "
        lowLabel="Least popular"
        highLabel="Most popular"
    >
        <Slider
            min={1}
            max={NUM_SLIDER_STOPS}
            step={1}
            value={state}
            onChange={onChange}
        />
    </SliderContainer>;
}
