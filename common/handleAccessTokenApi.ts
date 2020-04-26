export const METHOD = "POST";
export const PATH = "/api/handle_access_token";

export interface RequestQueryParams {
    oauth_verifier: string;
    oauth_token: string;
}

export function checkQueryParams(queryDict: {[key: string]: any}): queryDict is RequestQueryParams {
    return typeof queryDict.oauth_verifier === "string" && typeof queryDict.oauth_token === "string";
}
