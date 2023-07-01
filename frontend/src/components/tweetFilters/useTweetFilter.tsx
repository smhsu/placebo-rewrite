import React from "react";
import _ from "lodash";

import { Tweet } from "../../tweetModels/Tweet";
import { organizeIntoThreads, TweetThread } from "../../tweetModels/TweetThread";
import { ExperimentalCondition } from "../../common/ExperimentalCondition";
import { TweetPopularityCalculator, RandomPopularityCalculator } from "../../tweetModels/TweetPopularityCalculator";
import { OriginalOrderSorter, ConsistentShuffleSorter } from "../../tweetModels/ThreadSorter";

import { ITweetFilter } from "./ITweetFilter";
import { BucketPopularityFilter } from "./BucketPopularityFilter";
import { VagueBucketPopularityFilter } from "./VagueBucketPopularityFilter";
import { swapFilter } from "./SwapFilter";
import { NoSettingFilter } from "./NoSettingFilter";

const TWEET_FILTER_FOR_CONDITION: Record<ExperimentalCondition, ITweetFilter<any>> = {
    [ExperimentalCondition.POPULARITY_SLIDER]: new BucketPopularityFilter(
        new TweetPopularityCalculator(), new OriginalOrderSorter()
    ),
    [ExperimentalCondition.VAGUE_SLIDER]: new VagueBucketPopularityFilter(
        new TweetPopularityCalculator(), new OriginalOrderSorter()
    ),
    [ExperimentalCondition.NOT_WORKING_POPULARITY_SLIDER]: new BucketPopularityFilter(
        new RandomPopularityCalculator(), new ConsistentShuffleSorter()
    ),
    [ExperimentalCondition.SWAP_SETTING]: swapFilter,
    [ExperimentalCondition.NO_SETTING_RANDOM]: new NoSettingFilter(new ConsistentShuffleSorter()),
    [ExperimentalCondition.NO_SETTING]: new NoSettingFilter(new OriginalOrderSorter()),
    [ExperimentalCondition.UNKNOWN]: new NoSettingFilter(new OriginalOrderSorter())
};

interface TweetsRenderConfig {
    settingElement: JSX.Element | null;
    threads: TweetThread[];
    shouldAnimateChanges: boolean;
}

export function useTweetFilter(
    tweets: Tweet[],
    condition: ExperimentalCondition,
    onResetFeedSize: () => void,
    onClick=_.noop
): TweetsRenderConfig {
    const filterObj = TWEET_FILTER_FOR_CONDITION[condition];
    const [settingState, setSettingState] = React.useState(filterObj.initialState);
    let stateToUse = settingState;

    // Keep track of the experimental condition because if it changes, the setting changes and thus the setting's state.
    const [prevCondition, setPrevCondition] = React.useState<ExperimentalCondition | null>(null);
    if (condition !== prevCondition) {
        setSettingState(filterObj.initialState);
        setPrevCondition(condition);
        stateToUse = filterObj.initialState;
    }

    const Setting = filterObj.SettingComponent;
    const threads = React.useMemo(() => organizeIntoThreads(tweets), [tweets]);
    const settingElement = Setting ? <Setting
        currentState={stateToUse}
        onStateUpdated={setSettingState}
        onClick={onClick}
        onResetFeedSize={onResetFeedSize}
    /> : null;
    return {
        settingElement,
        threads: filterObj.doFilter(threads, stateToUse),
        shouldAnimateChanges: filterObj.shouldAnimateChanges,
    };
}
