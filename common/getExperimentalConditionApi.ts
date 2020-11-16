import { ExperimentalCondition } from "./ExperimentalCondition";

export const METHOD = "GET";
export const PATH = "/api/get_experimental_condition";

export interface ResponsePayload {
    assignment: ExperimentalCondition,
}
