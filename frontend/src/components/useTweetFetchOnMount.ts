import React from "react";
import querystring from "querystring";
import axios from "axios";
import { Status } from "twitter-d";
import * as GetTweetsApi from "../common/getTweetsApi";
import { getDebugOptions } from "../getDebugOptions";

import sampleTweets from "../sampleTweets.json";

/** Whether to use a static set of Tweets, and to skip directly to the onFetchSuccess handler. */
const IS_USING_STATIC_TWEETS = getDebugOptions("use_static_tweets") === "true";

function getTweetFetchParameters(): GetTweetsApi.RequestQueryParams | null {
    // Use the URL query string to check if we can immediately fetch the user's tweets.
    // substring(1) cuts off the "?" in the URL query string
    // Do this only once, at mount.
    const queryParams = querystring.parse(window.location.search.substring(1));
    return GetTweetsApi.extractQueryParams(queryParams);
}

interface TweetFetchHandlers {
    onError: (error: any) => void;
    onFetchSuccess: () => void;
}

export function useTweetFetchOnMount(handlers: TweetFetchHandlers) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [tweets, setTweets] = React.useState<Readonly<Status>[] | null>(
        IS_USING_STATIC_TWEETS ? sampleTweets as unknown as Status[] : null
    );

    const hasRun = React.useRef(false);
    React.useEffect(() => {
        if (hasRun.current) {
            return;
        }

        async function fetchTweets(params: GetTweetsApi.RequestQueryParams) {
            setIsLoading(true);
            try {
                const response = await axios.request<GetTweetsApi.ResponsePayload>({
                    method: GetTweetsApi.METHOD,
                    baseURL: GetTweetsApi.PATH,
                    params: params
                });
                setTweets(response.data.tweets);
                handlers.onFetchSuccess();
            } catch (error) {
                handlers.onError(error);
            }
            setIsLoading(false);
        }

        const fetchParams = getTweetFetchParameters();
        if (IS_USING_STATIC_TWEETS) {
            handlers.onFetchSuccess();
        } else if (fetchParams) {
            fetchTweets(fetchParams);
        }

        return () => { hasRun.current = true };
    }, [handlers]);

    return { tweets, isLoading };
}
