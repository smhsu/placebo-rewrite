import React from "react";
import { Slider } from "@material-ui/core";
import { flatten } from "lodash";

import { ITweetFilter } from "./ITweetFilter";
import { SliderContainer } from "./SliderContainer";
import { TweetPopularityCalculator } from "../../TweetPopularityCalculator";
import { AugmentedTweet } from "../../AugmentedTweet";

import "./ThresholdPopularityFilter.css";

export class ThresholdPopularityFilter implements ITweetFilter<number> {
    private _popularityCalculator: TweetPopularityCalculator;
    private _numStops: number;
    constructor(popularityCalculator: TweetPopularityCalculator, numStops: number) {
        this._popularityCalculator = popularityCalculator;
        this._numStops = numStops;
    }

    getInitialState(): number {
        return 0;
    }

    renderSetting(currentState: number, updateState: (newState: number) => void): JSX.Element {
        const halfRange = Math.floor(this._numStops / 2);
        const onChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
            if (typeof value === "number") {
                updateState(value);
            } else {
                updateState(value[0]);
            }
        };

        let trackStyle: "normal" | "inverted" | false;
        if (currentState === 0) {
            trackStyle = false;
        } else if (currentState < 0) {
            trackStyle = "normal"
        } else {
            trackStyle = "inverted";
        }

        return <SliderContainer
            mainLabel="Popularity"
            lowLabel="Only show least popular"
            highLabel="Only show most popular"
        >
            <div className="ThresholdPopularityFilter-middle-label">Show all</div>
            <Slider
                min={-halfRange}
                max={halfRange}
                step={1}
                value={currentState}
                track={trackStyle}
                onChange={onChange}
            />
        </SliderContainer>;
    }

    filter(tweets: AugmentedTweet[], currentState: number): AugmentedTweet[] {
        if (currentState === 0) {
            return tweets;
        }

        const numChunks = Math.floor(this._numStops / 2) + 1;
        const chunks = this._popularityCalculator.sortAndChunk(tweets, numChunks);
        if (currentState > 0) {
            return flatten(chunks.slice(currentState));
        } else {
            return flatten(chunks.slice(0, currentState));
        }
    }
}
