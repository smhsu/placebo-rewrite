export const METHOD = "GET";
export const PATH = "/api/get_experimental_condition";

export enum ExperimentalCondition {
    // Making these strings made Typescript happier because we have code that iterates through this enum.
    POPULARITY_SLIDER = "popularity_slider",
    NOT_WORKING_POPULARITY_SLIDER = "not_working_popularity_slider",
    SWAP_SETTING = "swap_setting",
    NO_SETTING = "no_setting",
    NO_SETTING_RANDOM = "no_setting_random",
    UNKNOWN = "unknown"
}

export interface ResponsePayload {
    assignment: ExperimentalCondition,
}
