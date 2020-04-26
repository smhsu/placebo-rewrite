export const METHOD = "POST";
export const PATH = "/api/request_token";

export interface ResponsePayload {
    oauth_token: string;
}
