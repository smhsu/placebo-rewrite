import React from "react";
import { ITweetFilter } from "./ITweetFilter";
import {organizeIntoThreads, TweetThread} from "../../TweetThread";
import { AugmentedTweet } from "../../AugmentedTweet";
import { ExperimentalCondition } from "../../common/getExperimentalConditionApi";

import { TweetPopularityCalculator, RandomPopularityCalculator } from "../../TweetPopularityCalculator";
import { RangePopularityFilter } from "./RangePopularityFilter";
import { swapFilter } from "./SwapFilter";
import { randomFilter } from "./RandomFilter";
import { noopFilter } from "./NoopFilter";

const TWEET_FILTER_FOR_CONDITION: Record<ExperimentalCondition, ITweetFilter<any>> = {
    [ExperimentalCondition.POPULARITY_SLIDER]: new RangePopularityFilter(new TweetPopularityCalculator()),
    [ExperimentalCondition.NOT_WORKING_POPULARITY_SLIDER]: new RangePopularityFilter(new RandomPopularityCalculator()),
    [ExperimentalCondition.SWAP_SETTING]: swapFilter,
    [ExperimentalCondition.NO_SETTING_RANDOM]: randomFilter,
    [ExperimentalCondition.NO_SETTING]: noopFilter,
    [ExperimentalCondition.UNKNOWN]: noopFilter
};

interface TweetsRenderConfig {
    settingElement: JSX.Element | null;
    threads: TweetThread[];
    shouldAnimateChanges: boolean;
}

export function useTweetFilter(
    tweets: AugmentedTweet[],
    condition: ExperimentalCondition,
    onChange?: () => void
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
    const handleSettingChanged = (newState: unknown) => {
        setSettingState(newState);
        onChange && onChange();
    };

    const threads = React.useMemo(() => organizeIntoThreads(tweets), [tweets]);
    return {
        settingElement: Setting ? <Setting currentState={stateToUse} onStateUpdated={handleSettingChanged} /> : null,
        threads: filterObj.doFilter(threads, stateToUse),
        shouldAnimateChanges: filterObj.shouldAnimateChanges,
    };
}
