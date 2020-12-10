import React from "react";
import memoizeOne from "memoize-one";
import { Slider } from "@material-ui/core";

import { ITweetFilter, SettingComponentProps } from "./ITweetFilter";
import { SliderContainer } from "./SliderContainer";
import { TweetThread } from "../../tweetModels/TweetThread";
import { ITweetPopularityCalculator } from "../../tweetModels/TweetPopularityCalculator";
import { IThreadSorter } from "../../tweetModels/ThreadSorter";
import { Tweet } from "../../tweetModels/Tweet";

const NUM_SLIDER_STOPS = 7;

export class BucketPopularityFilter implements ITweetFilter<number> {
    initialState = Math.ceil(NUM_SLIDER_STOPS * 0.5);
    shouldAnimateChanges = false;

    constructor(private _popularityCalculator: ITweetPopularityCalculator, private _threadSorter: IThreadSorter) {
        this._partitionThreadStartsByPopularity = memoizeOne(this._partitionThreadStartsByPopularity);
    }

    private _partitionThreadStartsByPopularity(threads: TweetThread[]) {
        const threadStarts = threads.map(thread => thread[0]);
        return this._popularityCalculator.partitionByPopularity(threadStarts, NUM_SLIDER_STOPS);
    }

    SettingComponent(props: SettingComponentProps<number>) {
        const {currentState, onStateUpdated} = props;
        const handleChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
            onStateUpdated(typeof value === "number" ? value : value[0]);
            window.scrollTo({top: 0, behavior: "smooth"});
        }

        return <SliderContainer
            mainLabel="Popularity"
            instructions="Display tweets of a certain popularity level first"
            lowLabel="Least popular"
            highLabel="Most popular"
        >
            <Slider
                min={1}
                max={NUM_SLIDER_STOPS}
                step={1}
                marks={true}
                value={currentState}
                onChange={handleChange}
            />
        </SliderContainer>;
    }

    doFilter(threads: TweetThread[], currentState: number): TweetThread[] {
        const threadForThreadStart = new Map<Tweet, TweetThread>();
        for (const thread of threads) {
            threadForThreadStart.set(thread[0], thread);
        }

        const partitions = this._partitionThreadStartsByPopularity(threads);
        // Minus 1 because the slider starts at 1, but the partition indexing starts at 0.
        const priorityIndex = currentState - 1;
        const priorityThreads = toThreads(partitions[priorityIndex] || []);
        const otherThreads = toThreads(partitions.filter((_tweets, i) => i !== priorityIndex).flat(1));
        return [...this._threadSorter.sort(priorityThreads), ...this._threadSorter.sort(otherThreads)];

        function toThreads(tweets: Tweet[]): TweetThread[] {
            // threadForThreadStart.get is marked as possibly returning undefined, but it never will because every
            // thread's start tweet should be in the map.
            return tweets.map(threadStart => threadForThreadStart.get(threadStart) || []);
        }
    }
}
