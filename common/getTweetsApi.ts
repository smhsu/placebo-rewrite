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

/**
 * Checks whether the input contains the parameters this API needs.
 * 
 * @param toCheck - anything to check
 * @return whether the input contains the right paramters for this API
 */
export function checkQueryParams(toCheck: unknown): toCheck is RequestQueryParams {
    return  typeof toCheck === "object" &&
        toCheck !== null &&
        typeof (toCheck as Record<string, unknown>).oauth_verifier === "string" &&
        typeof (toCheck as Record<string, unknown>).oauth_token === "string";
}

export interface ResponsePayload {
    tweets: Status[];
}
