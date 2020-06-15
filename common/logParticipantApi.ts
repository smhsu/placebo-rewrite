export const METHOD = "POST";
export const PATH = "/api/store_submission";

export interface RequestPayload {
    data: Record<string, unknown>;
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
        typeof (toCheck as Record<string, unknown>).data !== null;
}
