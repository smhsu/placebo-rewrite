export const METHOD = "GET"
export const PATH = "/api/get_experimental_condition"

export enum ExperimentalCondition {
    // Making these strings made Typescript happier because we have code that iterates through this enum.
    CONTROL = "control",
    EXPERIMENTAL = "experimental"
}

export interface ResponsePayload {
    assignment: ExperimentalCondition,
}
