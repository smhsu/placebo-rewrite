import React, {FunctionComponent, useEffect} from "react";

import {AugmentedTweet} from "../../AugmentedTweet";
import {ExperimentalCondition} from "../../common/getExperimentalConditionApi";

import {ITweetFilter} from "./ITweetFilter";
import {RangePopularityFilter} from "./RangePopularityFilter";
import {NoopFilter} from "./NoopFilter";


function getTweetFilterForCondition(condition: ExperimentalCondition): FunctionComponent<ITweetFilter> {
    switch (condition) {
        case ExperimentalCondition.POPULARITY_SLIDER:
        case ExperimentalCondition.NOT_WORKING_POPULARITY_SLIDER:
            return RangePopularityFilter;
        case ExperimentalCondition.SWAP_SETTING:
        case ExperimentalCondition.NO_SETTING:
        case ExperimentalCondition.NO_SETTING_RANDOM:
        case ExperimentalCondition.UNKNOWN:
        default:
            return NoopFilter;
    }
}

export function useTweetFilter(tweets: AugmentedTweet[], condition: ExperimentalCondition): FunctionComponent<ITweetFilter> | null {
    const [prevCondition, setPrevCondition] = React.useState<ExperimentalCondition>(ExperimentalCondition.UNKNOWN);
    // if (condition !== prevCondition) { // Setting type has changed.  We need to reset state.  Bail early.
    //     setPrevCondition(condition);
    //     return null;
    // }
    useEffect(() => {
        setPrevCondition(condition);
    }, [condition]);
    return getTweetFilterForCondition(prevCondition);
}
