import React from "react";
import memoizeOne from "memoize-one";
import { Switch, Slider, FormControlLabel } from "@material-ui/core";

import { ITweetFilter, SettingComponentProps } from "./ITweetFilter";
import { SliderContainer } from "./SliderContainer";
import { SettingsLayout } from "./SettingsLayout";
import { TweetThread } from "../../tweetModels/TweetThread";
import { ITweetPopularityCalculator } from "../../tweetModels/TweetPopularityCalculator";
import { IThreadSorter } from "../../tweetModels/ThreadSorter";
import { Tweet } from "../../tweetModels/Tweet";

interface BucketPopularityFilterState {
    isFiltering: boolean,
    value: number
}
const NUM_SLIDER_STOPS = 7;

export class BucketPopularityFilter implements ITweetFilter<BucketPopularityFilterState> {
    initialState = {
        isFiltering: false,
        value: Math.ceil(NUM_SLIDER_STOPS * 0.5)
    };
    shouldAnimateChanges = false;

    constructor(private _popularityCalculator: ITweetPopularityCalculator, private _threadSorter: IThreadSorter) {
        this._partitionThreadStartsByPopularity = memoizeOne(this._partitionThreadStartsByPopularity);
    }

    private _partitionThreadStartsByPopularity(threads: TweetThread[]) {
        const threadStarts = threads.map(thread => thread[0]);
        return this._popularityCalculator.partitionByPopularity(threadStarts, NUM_SLIDER_STOPS);
    }

    SettingComponent(props: SettingComponentProps<BucketPopularityFilterState>) {
        const {currentState, onStateUpdated, onClick, onResetFeedSize} = props;
        const handleCheckboxToggle = () => {
            onStateUpdated({
                isFiltering: !currentState.isFiltering,
                value: currentState.value
            });
            onResetFeedSize();
            onClick();
            window.setTimeout(() => window.scrollTo({top: 0, behavior: "smooth"}));
        }
        const handleChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
            onStateUpdated({
                isFiltering: true,
                value: typeof value === "number" ? value : value[0]
            });
            onResetFeedSize();
            onClick();
            window.setTimeout(() => window.scrollTo({top: 0, behavior: "smooth"}));
        }

        return <SettingsLayout>
            <FormControlLabel
                control={<Switch
                    checked={currentState.isFiltering}
                    onChange={handleCheckboxToggle}
                    color="primary"
                />}
                label="Filter by popularity"
            />

            <SliderContainer
                mainLabel=" "
                instructions="Move the slider to customize the popularity filter"
                lowLabel="Least popular"
                highLabel="Most popular"
                disabled={!currentState.isFiltering}
                onClick={() => { if (!currentState.isFiltering) { handleCheckboxToggle(); } } }
            >
                <Slider
                    min={1}
                    max={NUM_SLIDER_STOPS}
                    step={1}
                    marks={true}
                    value={currentState.value}
                    track={false}
                    disabled={!currentState.isFiltering}
                    onChange={handleChange}
                />
            </SliderContainer>
        </SettingsLayout>
    }

    doFilter(threads: TweetThread[], currentState: BucketPopularityFilterState): TweetThread[] {
        if (!currentState.isFiltering) {
            return threads;
        }

        const threadForThreadStart = new Map<Tweet, TweetThread>();
        for (const thread of threads) {
            threadForThreadStart.set(thread[0], thread);
        }

        const partitions = this._partitionThreadStartsByPopularity(threads);
        // Minus 1 because the slider starts at 1, but the partition indexing starts at 0.
        const priorityIndex = currentState.value - 1;
        const priorityThreads = toThreads(partitions[priorityIndex] || []);
        return this._threadSorter.sort(priorityThreads);
        //const otherThreads = toThreads(partitions.filter((_tweets, i) => i !== priorityIndex).flat(1));
        //return [...this._threadSorter.sort(priorityThreads), ...this._threadSorter.sort(otherThreads)];

        function toThreads(tweets: Tweet[]): TweetThread[] {
            // threadForThreadStart.get is marked as possibly returning undefined, but it never will because every
            // thread's start tweet should be in the map.
            return tweets.map(threadStart => threadForThreadStart.get(threadStart) || []);
        }
    }
}


/*
If you want a dropdown:

<select
    value={currentState.isFiltering.toString()}
    onChange={e => onStateUpdated({isFiltering: strToBool(e.currentTarget.value), value: currentState.value})}
    style={{
        backgroundColor: "white",
        border: "1px solid #ced4da",
        borderRadius: "0.25rem",
        padding: ".375rem 2rem .375rem .5rem",
        margin: "0.25rem 0rem"
    }}
>
    <option value="false">Default order</option>
    <option value="true">Sort by popularity</option>
</select>

 */
