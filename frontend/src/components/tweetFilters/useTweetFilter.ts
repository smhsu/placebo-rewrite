import React from "react";
import memoizeOne from "memoize-one";
import { Status } from "twitter-d";

import { TweetPopularityCalculator } from "../../TweetPopularityCalculator";
import { ExperimentalCondition } from "../../common/getExperimentalConditionApi";

import { ITweetFilter } from "./ITweetFilter";
import { RangePopularityFilter } from "./RangePopularityFilter";
import { RandomFilter } from "./RandomFilter";
import { LoadingFilter } from "./LoadingFilter";

const POPULARITY_CALCULATOR = new TweetPopularityCalculator();
POPULARITY_CALCULATOR.getPopularities = memoizeOne(POPULARITY_CALCULATOR.getPopularities);
POPULARITY_CALCULATOR.getPopularityRange = memoizeOne(POPULARITY_CALCULATOR.getPopularityRange);

const getTweetFilterForCondition = memoizeOne((condition: ExperimentalCondition): ITweetFilter<unknown> => {
    switch (condition) {
        case ExperimentalCondition.UNKNOWN:
            return new LoadingFilter();
        case ExperimentalCondition.RANDOMIZER_SETTING:
            return new RandomFilter();
        case ExperimentalCondition.POPULARITY_SLIDER:
        default:
            return new RangePopularityFilter(POPULARITY_CALCULATOR);
    }
});

interface ReturnValue {
    renderedSetting: React.ReactElement | null;
    filteredTweets: Status[];
}

export function useTweetFilter(tweets: Status[], condition: ExperimentalCondition, onChange?: () => void): ReturnValue {
    const filterObj = getTweetFilterForCondition(condition);
    const [prevCondition, setPrevCondition] = React.useState<ExperimentalCondition | null>(null);
    const [settingState, setSettingState] = React.useState(filterObj.getInitialState(tweets));

    if (condition !== prevCondition) { // We need to reset state.  Bail early.
        setSettingState(filterObj.getInitialState(tweets));
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
        renderedSetting: filterObj.renderSetting(tweets, settingState, wrappedOnChange),
        filteredTweets: filterObj.filter(tweets, settingState)
    };
}
