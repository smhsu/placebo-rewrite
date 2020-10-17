import React from "react";

import { TimeParsedTweet } from "../../TimeParsedTweet";
import { TweetPopularityCalculator } from "../../TweetPopularityCalculator";
import { ExperimentalCondition } from "../../common/getExperimentalConditionApi";

import { ITweetFilter } from "./ITweetFilter";
import { RangePopularityFilter } from "./RangePopularityFilter";
import { RandomFilter } from "./RandomFilter";
import { LoadingFilter } from "./LoadingFilter";
import { ThresholdPopularityFilter } from "./ThresholdPopularityFilter";
import { IntervalFilter } from "./IntervalFilter";

const NUM_SLIDER_STOPS = 9;
const POPULARITY_CALCULATOR = new TweetPopularityCalculator();

function getTweetFilterForCondition(condition: ExperimentalCondition): ITweetFilter<unknown> {
    switch (condition) {
        case ExperimentalCondition.UNKNOWN:
            return new LoadingFilter();
        case ExperimentalCondition.RANDOMIZER_SETTING:
        case ExperimentalCondition.RANDOM:
            return new RandomFilter(NUM_SLIDER_STOPS);
        case ExperimentalCondition.INTERVAL:
            return new IntervalFilter(POPULARITY_CALCULATOR, NUM_SLIDER_STOPS);
        case ExperimentalCondition.THRESHOLD:
            return new ThresholdPopularityFilter(POPULARITY_CALCULATOR, NUM_SLIDER_STOPS)
        case ExperimentalCondition.POPULARITY_SLIDER:
        case ExperimentalCondition.RANGE:
        default:
            return new RangePopularityFilter(POPULARITY_CALCULATOR, NUM_SLIDER_STOPS);
    }
}

interface ReturnValue {
    renderedSetting: React.ReactElement | null;
    filteredTweets: TimeParsedTweet[];
}

export function useTweetFilter(tweets: TimeParsedTweet[], condition: ExperimentalCondition, onChange?: () => void): ReturnValue {
    const filterObj = getTweetFilterForCondition(condition);
    const [prevCondition, setPrevCondition] = React.useState<ExperimentalCondition | null>(null);
    const [settingState, setSettingState] = React.useState(filterObj.getInitialState());

    if (condition !== prevCondition) { // Setting type has changed.  We need to reset state.  Bail early.
        setSettingState(filterObj.getInitialState());
        setPrevCondition(condition);
        console.warn('xxxxx', condition, settingState)
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
