/**
 * Payload when any of our backend APIs have an error.
 */
export interface ApiErrorPayload {
    statusCode: number;
    error: string;
    message: string;
}
