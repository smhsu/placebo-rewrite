import React from "react";
import axios from "axios";
import { Status } from "twitter-d";
import * as GetTweetsApi from "../common/getTweetsApi";

interface TweetFetchHandlers {
    onFetchSuccess: (tweets: Status[]) => void;
    onError: (error: unknown) => void;
}

/**
 * A React hook that fetches Tweets from the backend API, ensuring it only happens once per mount.
 *
 * @param fetchParams
 * @param handlers
 */
export function useTweetFetch(fetchParams: GetTweetsApi.RequestQueryParams | null, handlers: TweetFetchHandlers) {
    const hasRun = React.useRef(false);
    React.useEffect(() => {
        if (hasRun.current || fetchParams === null) {
            return;
        }

        async function fetchTweets(params: GetTweetsApi.RequestQueryParams) {
            try {
                const response = await axios.request<GetTweetsApi.ResponsePayload>({
                    method: GetTweetsApi.METHOD,
                    baseURL: GetTweetsApi.PATH,
                    params: params
                });
                handlers.onFetchSuccess(response.data.tweets);
            } catch (error) {
                handlers.onError(error);
            }
        }
        fetchTweets(fetchParams);

        return () => { hasRun.current = true };
    }, [fetchParams, handlers]);
}
