import { Status } from "twitter-d";

export const METHOD = "POST";
export const PATH = "/api/tweets";

/**
 * User's request token, i.e. permission to access their data, obtained from Step 2 of the 3-Legged OAuth process
 * described at https://developer.twitter.com/en/docs/basics/authentication/oauth-1-0a/obtaining-user-access-tokens 
 */
export interface RequestQueryParams {
    oauth_verifier: string;
    oauth_token: string;
}

export function checkQueryParams(queryDict: {[key: string]: any}): queryDict is RequestQueryParams {
    return typeof queryDict.oauth_verifier === "string" && typeof queryDict.oauth_token === "string";
}

export interface ResponsePayload {
    tweets: Status[];
}
