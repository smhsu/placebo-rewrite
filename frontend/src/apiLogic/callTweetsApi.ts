import axios from "axios";
import * as GetTweetsApi from "../common/getTweetsApi";
import { getStoredAuthVerifiers, deleteAuthVerifiers } from "./OAuth2Utils";

const CACHE_KEY = "tweetsCache";
const CACHE_TIME_TO_LIVE_MIN = 60;
const MILLISECONDS_PER_MIN = 60000;

interface CacheItem {
    date: number;
    apiResponse: GetTweetsApi.ResponsePayload;
}

function cacheApiResponse(response: GetTweetsApi.ResponsePayload) {
    const item: CacheItem = {
        date: Date.now(),
        apiResponse: response
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(item));
}

export function getCachedApiResponse(): GetTweetsApi.ResponsePayload | null {
    const item = window.localStorage.getItem(CACHE_KEY);
    if (!item) {
        return null;
    }

    const parsedItem: CacheItem = JSON.parse(item);
    const ageInMin = (Date.now() - parsedItem.date) / MILLISECONDS_PER_MIN;
    if (ageInMin > CACHE_TIME_TO_LIVE_MIN) {
        window.localStorage.removeItem(CACHE_KEY);
        return null;
    }

    return parsedItem.apiResponse;
}

/**
 * Detects if the user has authorized our app, and if so, fetches their tweets.  If there is no auth info, returns null.
 *
 * @param urlParams authorization code and saved OAuth2.0 state
 */
export function callTweetsApi(urlParams: URLSearchParams): Promise<GetTweetsApi.ResponsePayload> | null {
    // If the user has authorized our app, Twitter will redirect to our website with the code and state parameters
    // in the URL.  See https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    if (code === null || state === null) {
        return null;
    }

    const verifiers = getStoredAuthVerifiers();
    if (verifiers.state !== state) {
        return null;
    }

    const body: GetTweetsApi.RequestBody = {
        code,
        code_verifier: verifiers.code_verifier || ""
    };

    // This will prevent us from trying to use the verifiers more than once, as they only work once.
    deleteAuthVerifiers();
    const promise = axios.request<GetTweetsApi.ResponsePayload>({
        url: GetTweetsApi.PATH,
        method: GetTweetsApi.METHOD,
        data: body,
        responseType: "json"
    }).then(response => {
        cacheApiResponse(response.data);
        return response.data;
    });

    return promise;
}
