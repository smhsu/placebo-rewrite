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

/**
 * A subset of the most important Tweet data from Twitter.  For all properties, see
 * https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-home_timeline
 */
export interface Tweet {
    created_at: string;
    id: number;
    text: string;
    user: TwitterUser;
    retweet_count: number;
    favorite_count: number;
}

/**
 * A subset of the most important user data from Twitter.  For all properties, see
 * https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-home_timeline
 */
interface TwitterUser {
    id: number;
    name: string;
    screen_name: string;
    location: string;
    description: string;
    url: string;
    profile_image_url_https: string;
}
