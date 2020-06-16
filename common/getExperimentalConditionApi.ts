export const METHOD = "GET"
export const PATH = "/api/get_experimental_condition"

export enum ExperimentalCondition {
    // Making these strings made Typescript happier because we have code that iterates through this enum.
    POPULARITY_SLIDER = "popularity_slider",
    RANDOMIZER_SETTING = "random_setting",
    UNKNOWN = "unknown"
}

export interface ResponsePayload {
    assignment: ExperimentalCondition,
}
