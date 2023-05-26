import { Status } from "twitter-d";

export const METHOD = "POST";
export const PATH = "/api/tweets";

/**
 * User's authorization code, i.e. permission to access their data.  Obtained after a call to
 * https://twitter.com/i/oauth2/authorize.  Also contains the PKCE code verifier string.  These two in combination can
 * be converted into an authorization token to access the Twitter API.
 */
export interface RequestBody {
    code: string;
    code_verifier: string;
}

/**
 * @param toVerify - variable to verify
 * @return whether the variable contains Twitter authorization code information
 */
export function verifyRequestBody(toVerify: unknown): toVerify is RequestBody {
    return typeof toVerify === "object" &&
        toVerify !== null &&
        typeof (toVerify as Record<string, unknown>)["code"] === "string" &&
        typeof (toVerify as Record<string, unknown>)["code_verifier"] === "string";
}

export interface ResponsePayload {
    tweets: Status[];
}
