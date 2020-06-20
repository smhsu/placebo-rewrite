import React from "react";
import { Slider } from "@material-ui/core";
import { flatten } from "lodash";

import { ITweetFilter } from "./ITweetFilter";
import { SliderContainer } from "./SliderContainer";
import { TweetPopularityCalculator } from "../../TweetPopularityCalculator";
import { TimeParsedTweet } from "../../TimeParsedTweet";

export class RangePopularityFilter implements ITweetFilter<[number, number]> {
    private _popularityCalculator: TweetPopularityCalculator;
    private _numSliderStops: number;
    constructor(popularityCalculator: TweetPopularityCalculator, numStops: number) {
        this._popularityCalculator = popularityCalculator;
        this._numSliderStops = numStops;
    }
    
    getInitialState(): [number, number] {
        return [1, this._numSliderStops];
    }

    renderSetting(currentState: [number, number], updateState: (newState: [number, number]) => void): JSX.Element {
        const onChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
            if (typeof value === "number") {
                updateState([value, value]);
            } else {
                updateState(value as [number, number]);
            }
        };

        return <SliderContainer
            mainLabel="Popularity range"
            lowLabel="Least popular"
            highLabel="Most popular"
        >
            <Slider
                min={1}
                max={this._numSliderStops}
                step={1}
                value={currentState}
                onChange={onChange}
            />
        </SliderContainer>;
    }

    filter(tweets: TimeParsedTweet[], currentState: [number, number]): TimeParsedTweet[] {
        const chunks = this._popularityCalculator.sortAndChunk(tweets, this._numSliderStops);
        return flatten(chunks.slice(currentState[0] - 1, currentState[1]));
    }
}
