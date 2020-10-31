import React from "react";
import { Slider } from "@material-ui/core";

import { SliderContainer } from "./SliderContainer";
import { ITweetFilter } from "./ITweetFilter";
import { TweetPopularityCalculator } from "../../TweetPopularityCalculator";
import { AugmentedTweet } from "../../AugmentedTweet";

export class IntervalFilter implements ITweetFilter<number> {
    private _popularityCalculator: TweetPopularityCalculator;
    private _numStops: number;
    constructor(popularityCalculator: TweetPopularityCalculator, numStops: number) {
        this._popularityCalculator = popularityCalculator;
        this._numStops = numStops;
    }
    
    getInitialState() {
        return Math.floor(this._numStops / 2);
    }

    renderSetting(
        currentState: number,
        updateState: (newState: number) => void
    ): JSX.Element {
        const onChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
            if (typeof value === "number") {
                updateState(value);
            } else {
                updateState(value[0]);
            }
        };

        return <SliderContainer
            mainLabel="Popularity"
            lowLabel="Least popular"
            highLabel="Most popular"
        >
            <Slider
                min={0}
                max={this._numStops - 1}
                step={1}
                value={currentState}
                onChange={onChange}
            />
        </SliderContainer>;
    }

    filter(tweets: AugmentedTweet[], currentState: number): AugmentedTweet[] {
        if (tweets.length === 0) {
            return tweets;
        }

        const chunks = this._popularityCalculator.sortAndChunk(tweets, this._numStops);
        return chunks[currentState];
    }
}
