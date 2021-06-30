export enum ExperimentalCondition {
    // Making these strings made Typescript happier because we have code that iterates through this enum.
    POPULARITY_SLIDER = "popularity_slider",
    NOT_WORKING_POPULARITY_SLIDER = "not_working_popularity_slider",
    SWAP_SETTING = "swap_setting",
    NO_SETTING = "no_setting",
    NO_SETTING_RANDOM = "no_setting_random",
    UNKNOWN = "unknown"
}

export const DesiredProportions: Record<ExperimentalCondition, number> = {
    [ExperimentalCondition.POPULARITY_SLIDER]: 0.3,
    [ExperimentalCondition.NOT_WORKING_POPULARITY_SLIDER]: 0.3,
    [ExperimentalCondition.SWAP_SETTING]: 0.2,
    [ExperimentalCondition.NO_SETTING]: 0.1,
    [ExperimentalCondition.NO_SETTING_RANDOM]: 0.1,
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
