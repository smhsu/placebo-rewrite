import React, { useState } from "react";
import { ITweetFilter } from "./ITweetFilter";
import { TweetThread } from "../../TweetThread";
import { AugmentedTweet } from "../../AugmentedTweet";
import { ExperimentalCondition } from "../../common/getExperimentalConditionApi";

import { rangePopularityFilter } from "./RangePopularityFilter";
import { swapFilter } from "./SwapFilter";
import { randomFilter } from "./RandomFilter";
import { noopFilter } from "./NoopFilter";

const TWEET_FILTER_FOR_CONDITION: Record<ExperimentalCondition, ITweetFilter<any>> = {
    [ExperimentalCondition.POPULARITY_SLIDER]: rangePopularityFilter,
    [ExperimentalCondition.NOT_WORKING_POPULARITY_SLIDER]: rangePopularityFilter,
    [ExperimentalCondition.SWAP_SETTING]: swapFilter,
    [ExperimentalCondition.NO_SETTING_RANDOM]: randomFilter,
    [ExperimentalCondition.NO_SETTING]: noopFilter,
    [ExperimentalCondition.UNKNOWN]: noopFilter
};

interface TweetsRenderConfig {
    settingElement: JSX.Element | null;
    branches: TweetThread[];
    shouldAnimateTweetChanges: boolean;
}

export function useTweetFilter(
    tweets: AugmentedTweet[],
    condition: ExperimentalCondition,
    onChange?: () => void
): TweetsRenderConfig {
    const filterObj = TWEET_FILTER_FOR_CONDITION[condition];
    const [settingState, setSettingState] = useState(filterObj.initialState);
    let stateToUse = settingState;

    // Keep track of the experimental condition because if it changes, the setting changes and thus the setting's state.
    const [prevCondition, setPrevCondition] = useState<ExperimentalCondition | null>(null);
    if (condition !== prevCondition) {
        setSettingState(filterObj.initialState);
        setPrevCondition(condition);
        stateToUse = filterObj.initialState;
    }

    const Setting = filterObj.SettingComponent;
    const handleSettingChanged = (newState: unknown) => {
        setSettingState(newState);
        onChange && onChange();
    }
    return {
        settingElement: Setting ? <Setting currentState={stateToUse} onStateUpdated={handleSettingChanged} /> : null,
        branches: filterObj.doFilter(tweets, stateToUse),
        shouldAnimateTweetChanges: filterObj.shouldAnimateTweetChanges,
    };
}
