import { Slider } from "@material-ui/core";
import React from "react";

import { ITweetFilter, SettingComponentProps } from "./ITweetFilter";
import { BucketPopularityFilter } from "./BucketPopularityFilter";
import { SettingsLayout } from "./SettingsLayout";
import { ITweetPopularityCalculator } from "../../tweetModels/TweetPopularityCalculator";
import { IThreadSorter } from "../../tweetModels/ThreadSorter";
import { TweetThread } from "../../tweetModels/TweetThread";

const NUM_SLIDER_STOPS = 7;

export class VagueBucketPopularityFilter implements ITweetFilter<number> {
    initialState = Math.ceil(NUM_SLIDER_STOPS * 0.5);
    shouldAnimateChanges = false;

    private _bucketPopularityFilter;

    constructor(popularityCalculator: ITweetPopularityCalculator, threadSorter: IThreadSorter) {
        this._bucketPopularityFilter = new BucketPopularityFilter(popularityCalculator, threadSorter);
    }

    SettingComponent(props: SettingComponentProps<number>) {
        const {currentState, onStateUpdated, onClick, onResetFeedSize} = props;
        const handleChange = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
            onStateUpdated(typeof value === "number" ? value : value[0]);
            onResetFeedSize();
            onClick();
            window.setTimeout(() => window.scrollTo({top: 0, behavior: "smooth"}));
        }

        return <SettingsLayout heading={<div className="SettingsLayout-header">Popularity</div>}>
            <Slider
                style={{ marginTop: 10 }}
                min={1}
                max={NUM_SLIDER_STOPS}
                step={1}
                marks={true}
                value={currentState}
                track={false}
                onChange={handleChange}
            />
        </SettingsLayout>;
    }

    doFilter(threads: TweetThread[], currentState: number): TweetThread[] {
        return this._bucketPopularityFilter.doFilter(threads, { isFiltering: true, value: currentState });
    }
}
