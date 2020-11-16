import React from "react";
import { Slider } from "@material-ui/core";
import { flatten } from "lodash";

import { ITweetFilter, SettingComponentProps } from "./ITweetFilter";
import { SliderContainer } from "./SliderContainer";
import { TweetThread, organizeIntoThreads } from "../../TweetThread";
import { TweetPopularityCalculator } from "../../TweetPopularityCalculator";
import { AugmentedTweet } from "../../AugmentedTweet";

const NUM_SLIDER_STOPS = 9;
const POPULARITY_CALCULATOR = new TweetPopularityCalculator();

type Interval = [number, number];

export const rangePopularityFilter: ITweetFilter<Interval> = {
    initialState: [1, NUM_SLIDER_STOPS],

    SettingComponent(props: SettingComponentProps<Interval>) {
        const {currentState, onStateUpdated} = props;
        const handleChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
            if (typeof value === "number") {
                onStateUpdated([value, value]);
            } else {
                onStateUpdated(value as Interval);
            }
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
                value={currentState}
                onChange={handleChange}
            />
        </SliderContainer>;
    },

    doFilter(tweets: AugmentedTweet[], currentState: Interval): TweetThread[] {
        const chunks = POPULARITY_CALCULATOR.sortAndChunk(tweets, NUM_SLIDER_STOPS);
        const processedTweets = flatten(chunks.slice(currentState[0] - 1, currentState[1]));
        return organizeIntoThreads(processedTweets);
    },

    shouldAnimateTweetChanges: false,
};
