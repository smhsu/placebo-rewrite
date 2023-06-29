export enum ExperimentalCondition {
    // Making these strings made Typescript happier because we have code that iterates through this enum.
    POPULARITY_SLIDER = "popularity_slider",
    NOT_WORKING_POPULARITY_SLIDER = "not_working_popularity_slider",
    SWAP_SETTING = "swap_setting",
    NO_SETTING = "no_setting",
    NO_SETTING_RANDOM = "no_setting_random",
    UNKNOWN = "unknown"
}

export const ContinuationCodeForCondition: Record<ExperimentalCondition, string> = {
    [ExperimentalCondition.POPULARITY_SLIDER]: "402d5ab282fe67",
    [ExperimentalCondition.NOT_WORKING_POPULARITY_SLIDER]: "b4eac21faba2",
    [ExperimentalCondition.SWAP_SETTING]: "184dd420dc252df",
    [ExperimentalCondition.NO_SETTING]: "57be72e7b1f8",
    [ExperimentalCondition.NO_SETTING_RANDOM]: "446e246e64d1",
    [ExperimentalCondition.UNKNOWN]: process.env.REACT_APP_ERROR_CONTINUE_CODE || "tweets_error_30bfa3e53"
}

export function parseCondition(condition: string): ExperimentalCondition {
    for (const value of Object.values(ExperimentalCondition)) {
        if (condition === value) {
            return value;
        }
    }
    return ExperimentalCondition.UNKNOWN;
}

export const DesiredProportions: Record<ExperimentalCondition, number> = {
    [ExperimentalCondition.POPULARITY_SLIDER]: 0.345,
    [ExperimentalCondition.NOT_WORKING_POPULARITY_SLIDER]: 0.345,
    [ExperimentalCondition.SWAP_SETTING]: 0.15,
    [ExperimentalCondition.NO_SETTING]: 0.08,
    [ExperimentalCondition.NO_SETTING_RANDOM]: 0.08,
    [ExperimentalCondition.UNKNOWN]: 0
};

export function getRandomCondition(): ExperimentalCondition {
    const randomNum = Math.random();
    let cumulativeProportion = 0;
    for (const [condition, proportion] of Object.entries(DesiredProportions)) {
        cumulativeProportion += proportion;
        if (randomNum < cumulativeProportion) {
            return condition as ExperimentalCondition;
        }
    }
    return ExperimentalCondition.POPULARITY_SLIDER;
}
