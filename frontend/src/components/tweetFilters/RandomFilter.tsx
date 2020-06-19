import React from "react";
import { Slider } from "@material-ui/core";
import seedrandom from "seedrandom";

import { ITweetFilter } from "./ITweetFilter";
import { SliderContainer } from "./SliderContainer";
import { TimeParsedTweet } from "../../TimeParsedTweet";

const randomSeedPrefix = Date.now().toString();

export class RandomFilter implements ITweetFilter<number> {
    private _numStops: number;
    constructor(numSliderStops: number) {
        this._numStops = numSliderStops;
    }

    getInitialState(): number {
        return 0;
    }

    renderSetting(currentState: number, updateState: (newState: number) => void): JSX.Element {
        const onChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
            if (typeof value === "number") {
                updateState(value);
            } else {
                updateState(value[0]);
            }
        };

        return <SliderContainer mainLabel="Randomize">
            <Slider min={0} max={this._numStops - 1} step={1} marks={true} value={currentState} onChange={onChange} />
        </SliderContainer>;
    }

    filter(tweets: TimeParsedTweet[], currentState: number): TimeParsedTweet[] {
        const shuffled = this.shuffled(tweets, currentState);
        const subsetSize = Math.ceil(tweets.length / this._numStops);
        return shuffled.slice(0, subsetSize);
    }

    shuffled(tweets: TimeParsedTweet[], seed: number): TimeParsedTweet[] {
        const rng = seedrandom(randomSeedPrefix + seed);
        const shuffled = tweets.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(rng.quick() * (i + 1)); // Random integer such that 0 ≤ j ≤ i
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    }
}
