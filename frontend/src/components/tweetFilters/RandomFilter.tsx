import React from "react";
import { Slider } from "@material-ui/core";
import { Status } from "twitter-d";
import { shuffle } from "lodash";

import { ITweetFilter } from "./ITweetFilter";
import { SliderContainer } from "./SliderContainer";

export class RandomFilter implements ITweetFilter<number> {
    getInitialState(): number {
        return 1;
    }

    renderSetting(_tweets: Status[], currentState: number, updateState: (newState: number) => void): JSX.Element {
        const onChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
            if (typeof value === "number") {
                updateState(value);
            } else {
                updateState(value[0]);
            }
        };

        return <SliderContainer mainLabel="Randomize">
            <Slider min={1} max={10} step={1} marks={true} value={currentState} onChange={onChange} />
        </SliderContainer>;
    }

    filter(tweets: Status[]): Status[] {
        return shuffle(tweets);
    }
}
