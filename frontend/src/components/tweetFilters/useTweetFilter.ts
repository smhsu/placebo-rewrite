import React from "react";

import { AugmentedTweet } from "../../AugmentedTweet";
import { TweetPopularityCalculator } from "../../TweetPopularityCalculator";
import { ExperimentalCondition } from "../../common/getExperimentalConditionApi";

import { ITweetFilter } from "./ITweetFilter";
import { RangePopularityFilter } from "./RangePopularityFilter";
import { NoopFilter } from "./NoopFilter";

const NUM_SLIDER_STOPS = 9;
const POPULARITY_CALCULATOR = new TweetPopularityCalculator();

function getTweetFilterForCondition(condition: ExperimentalCondition): ITweetFilter<unknown> {
    switch (condition) {
        case ExperimentalCondition.SWAP_SETTING:
            return new NoopFilter();
        case ExperimentalCondition.POPULARITY_SLIDER:
        case ExperimentalCondition.NOT_WORKING_POPULARITY_SLIDER:
            return new RangePopularityFilter(POPULARITY_CALCULATOR, NUM_SLIDER_STOPS);
        case ExperimentalCondition.NO_SETTING:
        case ExperimentalCondition.NO_SETTING_RANDOM:
        case ExperimentalCondition.UNKNOWN:
        default:
            return new NoopFilter();
    }
}

interface ReturnValue {
    renderedSetting: React.ReactNode;
    filteredTweets: AugmentedTweet[];
}

export function useTweetFilter(tweets: AugmentedTweet[], condition: ExperimentalCondition, onChange?: () => void): ReturnValue {
    const filterObj = getTweetFilterForCondition(condition);
    const [prevCondition, setPrevCondition] = React.useState<ExperimentalCondition | null>(null);
    const [settingState, setSettingState] = React.useState(filterObj.getInitialState());

    if (condition !== prevCondition) { // Setting type has changed.  We need to reset state.  Bail early.
        setSettingState(filterObj.getInitialState());
        setPrevCondition(condition);
        return {
            renderedSetting: null,
            filteredTweets: tweets
        };
    }

    const wrappedOnChange = (newState: unknown) => {
        setSettingState(newState);
        onChange && onChange();
    }

    return {
        renderedSetting: filterObj.renderSetting(settingState, wrappedOnChange),
        filteredTweets: filterObj.filter(tweets, settingState)
    };
}
