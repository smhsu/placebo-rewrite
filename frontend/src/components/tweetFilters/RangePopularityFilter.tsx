import React from "react";
import memoizeOne from "memoize-one";
import { Slider } from "@material-ui/core";

import { ITweetFilter, SettingComponentProps } from "./ITweetFilter";
import { SliderContainer } from "./SliderContainer";
import { TweetThread } from "../../tweetModels/TweetThread";
import { ITweetPopularityCalculator } from "../../tweetModels/TweetPopularityCalculator";
import { IThreadSorter } from "../../tweetModels/ThreadSorter";
import { Tweet } from "../../tweetModels/Tweet";

const NUM_SLIDER_STOPS = 9;
type Interval = [number, number];

export class RangePopularityFilter implements ITweetFilter<Interval> {
    initialState = [1, NUM_SLIDER_STOPS] as Interval;
    shouldAnimateChanges = false;

    constructor(private _popularityCalculator: ITweetPopularityCalculator, private _threadSorter: IThreadSorter) {
        this._partitionThreadStartsByPopularity = memoizeOne(this._partitionThreadStartsByPopularity);
    }

    private _partitionThreadStartsByPopularity(threads: TweetThread[]) {
        const threadStarts = threads.map(thread => thread[0]);
        return this._popularityCalculator.partitionByPopularity(threadStarts, NUM_SLIDER_STOPS);
    }

    SettingComponent(props: SettingComponentProps<Interval>) {
        const {currentState, onStateUpdated, onClick} = props;
        const handleChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
            if (typeof value === "number") {
                onStateUpdated([value, value]);
            } else {
                onStateUpdated(value as Interval);
            }
        };

        return <SliderContainer
            mainLabel="Popularity range"
            instructions="Move the circles to customize Tweets."
            lowLabel="Least popular"
            highLabel="Most popular"
        >
            <Slider
                min={1}
                max={NUM_SLIDER_STOPS}
                step={1}
                value={currentState}
                onChange={handleChange}
                onClick={onClick}
            />
        </SliderContainer>;
    }

    doFilter(threads: TweetThread[], currentState: Interval): TweetThread[] {
        const threadForThreadStart = new Map<Tweet, TweetThread>();
        for (const thread of threads) {
            threadForThreadStart.set(thread[0], thread);
        }

        const partitions = this._partitionThreadStartsByPopularity(threads);
        // currentState[0] - 1 because the slider starts at 1, but the partition indexing starts at 0.
        const desiredPartitions = partitions.slice(currentState[0] - 1, currentState[1]);
        const desiredThreads = desiredPartitions.flat(1).map(threadStart =>
            // threadForThreadStart.get is marked as possibly returning undefined, but it never will because every
            // thread's start tweet should be in the map.
            threadForThreadStart.get(threadStart) || []
        );
        return this._threadSorter.sort(desiredThreads);
    }
}
