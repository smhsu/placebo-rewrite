import React from "react";
import { Slider } from "@material-ui/core";
import { Status } from "twitter-d";

import { ITweetFilter } from "./ITweetFilter";
import { SliderContainer } from "./SliderContainer";
import { TweetPopularityCalculator } from "../../TweetPopularityCalculator";

export class ThresholdPopularityFilter implements ITweetFilter<number> {
    private _popularityCalculator: TweetPopularityCalculator;
    constructor(popularityCalculator: TweetPopularityCalculator) {
        this._popularityCalculator = popularityCalculator;
    }

    getInitialState(): number {
        return 0;
    }

    renderSetting(tweets: Status[], currentState: number, updateState: (newState: number) => void): JSX.Element {
        const onChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
            if (typeof value === "number") {
                updateState(value);
            } else {
                updateState(value[0]);
            }
        };

        const [minPopularity, maxPopularity] = this._popularityCalculator.getPopularityRange(tweets);
        const popularityRange = maxPopularity - minPopularity;
        return <SliderContainer
            mainLabel="Popularity"
            lowLabel="Only show least popular"
            highLabel="Only show most popular"
        >
            <Slider
                min={-popularityRange}
                max={popularityRange}
                step={popularityRange/4}
                value={currentState}
                onChange={onChange}
            />
        </SliderContainer>;
    }

    filter(tweets: Status[], currentState: number): Status[] {
        if (currentState === 0) {
            return tweets;
        }
        
        const popularities = this._popularityCalculator.getPopularities(tweets);
        const [minPopularity, maxPopularity] = this._popularityCalculator.getPopularityRange(tweets);
        if (currentState > 0) {
            const minThreshold = minPopularity + currentState;
            return tweets.filter((tweet, i) => popularities[i] >= minThreshold);
        } else {
            // `currentState` is negative so we are actually subtracting
            const maxThreshold = maxPopularity + currentState + 0.00001; // + a small amount because precision issues
            return tweets.filter((tweet, i) => popularities[i] <= maxThreshold);
        }
    }
}
