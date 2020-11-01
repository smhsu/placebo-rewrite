import React from "react";
import axios from "axios";

import { AppState, ErrorInfo } from "./AppState";
import { InstructionsAndButton } from "./InstructionsAndButton";
import { TwitterLoginButton } from "./TwitterLoginButton";

import { TweetAugmenter, AugmentedTweet } from "../AugmentedTweet";
import * as GetTweetsApi from "../common/getTweetsApi";

interface Props {
    /** Current state of the app. */
    appState: AppState;

    /** Error info to render if the app is in an error state. */
    errorInfo?: ErrorInfo;

    /**
     * Object that may optionally contain the authentication information to fetch tweets.  The *first* time valid
     * authentication information is detected inside this object, fetching will automatically happen, and it will not
     * happen again for the lifetime of the component.
     */
    queryParams?: Record<string, string | string[] | undefined>;

    /** Callback for when an attempt to fetch tweets starts. */
    onTweetPromise: (tweetPromise: Promise<AugmentedTweet[]>) => void;

    /** Callback for errors that happen when trying to log in. */
    onLoginError: (error: unknown) => void;
}

/**
 * Renders an interface for users to authorize our app with Twitter.  Automatically fetches tweets if valid
 * authentication information is detected inside the `queryParams` prop.
 *
 * @author Silas Hsu
 */
export function TwitterLoginFlow(props: Props) {
    const {appState, errorInfo, queryParams, onTweetPromise, onLoginError} = props;
    const hasFetched = React.useRef(false);
    React.useEffect(() => { // Fetch tweets if valid info in the query params is detected.
        if (hasFetched.current || !queryParams) {
            return;
        }

        const fetchParams = GetTweetsApi.extractQueryParams(queryParams);
        if (!fetchParams) {
            return;
        }

        onTweetPromise(
            axios.request<GetTweetsApi.ResponsePayload>({
                method: GetTweetsApi.METHOD,
                baseURL: GetTweetsApi.PATH,
                params: fetchParams
            })
            .then(response =>  new TweetAugmenter().augmentAll(response.data.tweets))
        );

        return () => { hasFetched.current = true };
    }, [queryParams, onTweetPromise]);

    const loginButton = <TwitterLoginButton onError={onLoginError} />;
    switch (appState) {
        case AppState.START:
            return <InstructionsAndButton buttonElement={loginButton} />;
        case AppState.ERROR:
            return <InstructionsAndButton errorInfo={errorInfo} buttonElement={loginButton} />;
        default:
            return null;
    }
}
