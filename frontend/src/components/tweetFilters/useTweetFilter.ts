import React from "react";
import memoizeOne from "memoize-one";
import { Status } from "twitter-d";

import { TweetPopularityCalculator } from "../../TweetPopularityCalculator";
import { ITweetFilter } from "./ITweetFilter";
import { ThresholdPopularityFilter } from "./ThresholdPopularityFilter";
import { RangePopularityFilter } from "./RangePopularityFilter";
import { RandomFilter } from "./RandomFilter";

export enum TweetFilterType {
    RANDOM = "random",
    THRESHOLD = "threshold",
    RANGE = "range"
}

const POPULARITY_CALCULATOR = new TweetPopularityCalculator();
POPULARITY_CALCULATOR.getPopularities = memoizeOne(POPULARITY_CALCULATOR.getPopularities);
POPULARITY_CALCULATOR.getPopularityRange = memoizeOne(POPULARITY_CALCULATOR.getPopularityRange);

export function useTweetFilter(tweets: Status[], filterType: TweetFilterType) {
    let filterObj: ITweetFilter<unknown>;
    switch (filterType) {
        case TweetFilterType.THRESHOLD:
            filterObj = new ThresholdPopularityFilter(POPULARITY_CALCULATOR);
            break;
        case TweetFilterType.RANGE:
            filterObj = new RangePopularityFilter(POPULARITY_CALCULATOR);
            break;
        case TweetFilterType.RANDOM:
        default:
            filterObj = new RandomFilter();
    }
    console.log(POPULARITY_CALCULATOR.getPopularities(tweets));
    const [settingState, updateSettingState] = React.useState(filterObj.getInitialState(tweets));
    return {
        renderedSetting: filterObj.renderSetting(tweets, settingState, updateSettingState),
        filteredTweets: filterObj.filter(tweets, settingState)
    };
}
