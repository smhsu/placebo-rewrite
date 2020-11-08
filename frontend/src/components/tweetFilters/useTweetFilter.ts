import React, {FunctionComponent, useEffect} from "react";

import {ExperimentalCondition} from "../../common/getExperimentalConditionApi";

import {ITweetFilter} from "./ITweetFilter";
import {RangePopularityFilter} from "./RangePopularityFilter";
import {SwapFilter} from "./SwapFilter";
import {RandomizeFilter} from "./RandomizeFilter";


export function useTweetFilter(condition: ExperimentalCondition): FunctionComponent<ITweetFilter> | null {
    const [prevCondition, setPrevCondition] = React.useState(ExperimentalCondition.UNKNOWN);
    useEffect(() => {
        setPrevCondition(condition);
    }, [condition]);
    switch (prevCondition) {
        case ExperimentalCondition.POPULARITY_SLIDER:
        case ExperimentalCondition.NOT_WORKING_POPULARITY_SLIDER:
            return RangePopularityFilter;
        case ExperimentalCondition.SWAP_SETTING:
            return SwapFilter;
        case ExperimentalCondition.NO_SETTING_RANDOM:
            return RandomizeFilter
        case ExperimentalCondition.NO_SETTING:
        case ExperimentalCondition.UNKNOWN:
        default:
            return null;
    }
}
