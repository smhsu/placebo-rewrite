import React from "react";
import { Slider } from "@material-ui/core";
import { Status } from "twitter-d";

import { ITweetFilter } from "./ITweetFilter";
import { SliderContainer } from "./SliderContainer";
import { TweetPopularityCalculator } from "../../TweetPopularityCalculator";

export class RangePopularityFilter implements ITweetFilter<[number, number]> {
    private _popularityCalculator: TweetPopularityCalculator;
    constructor(popularityCalculator: TweetPopularityCalculator) {
        this._popularityCalculator = popularityCalculator;
    }
    
    getInitialState(tweets: Status[]): [number, number] {
        return this._popularityCalculator.getPopularityRange(tweets);
    }

    renderSetting(
        tweets: Status[],
        currentState: [number, number],
        updateState: (newState: [number, number]) => void
    ): JSX.Element {
        const [minPopularity, maxPopularity] = this._popularityCalculator.getPopularityRange(tweets);
        const range = maxPopularity - minPopularity;
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
                min={minPopularity}
                max={maxPopularity}
                step={range/8}
                value={currentState}
                onChange={onChange}
            />
        </SliderContainer>;
    }

    filter(tweets: Status[], currentState: [number, number]): Status[] {
        const popularities = this._popularityCalculator.getPopularities(tweets);
        return tweets.filter((tweet, i) => currentState[0] <= popularities[i] && popularities[i] <= currentState[1]);
    }
}
