import { ExperimentalCondition } from "./ExperimentalCondition";

export const METHOD = "POST";
export const PATH = "/api/store_log";

export interface IParticipantLog {
    qualtricsID: string;
    chosenTopics: string[];
    tweetStats: {
        count: number,
        uniqueAccounts: number,
        createdAtMean: number,
        createdAtVariance: number,
        createdAtRange: [number, number]
    }
    experimentalCondition: ExperimentalCondition;
    numSettingInteractions: number;
    pixelsScrolledDown: number;
    pixelsScrolledUp: number;
    maxScrollY: number;
}

export interface RequestPayload {
    data: IParticipantLog;
}

/**
 * Checks whether the input contains the parameters this API needs.
 * 
 * @param toCheck - anything to check
 * @return whether the input contains the right paramters for this API
 */
export function isRequestPayload(toCheck: unknown): toCheck is RequestPayload {
    return typeof toCheck === "object" &&
        toCheck !== null &&
        typeof (toCheck as Record<string, unknown>).data === "object" &&
        (toCheck as Record<string, unknown>).data !== null;
}
