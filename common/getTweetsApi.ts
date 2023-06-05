import { MediaObjectV2, TweetV2, UserV2 } from "twitter-api-v2";

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

/**
 * Same structure as what is returned from the Twitter API.
 * https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-reverse-chronological
 *
 * Also see https://developer.twitter.com/en/docs/twitter-api/data-dictionary/introduction for types in this payload.
 */
export interface ResponsePayload {
    data: TweetV2[];
    includes: {
        tweets: TweetV2[];
        users: UserV2[];
        media: MediaObjectV2[];
    }
}
