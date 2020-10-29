/**
 * Payload when any of our backend APIs have an error.
 */
export interface ApiErrorPayload {
    statusCode: number;
    error: string;
    message: string;
}

export function isApiErrorPayload(toCheck: unknown): toCheck is ApiErrorPayload {
    if (typeof toCheck !== "object" || toCheck === null) {
        return false;
    }
    const obj = toCheck as ApiErrorPayload;
    return typeof obj.statusCode === "number" &&
        typeof obj.error === "string" &&
        typeof obj.message === "string";
}
