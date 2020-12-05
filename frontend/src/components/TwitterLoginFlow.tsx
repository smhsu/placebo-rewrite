import React from "react";
import axios from "axios";

import { AppState, ErrorInfo } from "./AppState";
import { InstructionsAndButton } from "./InstructionsAndButton";
import { TwitterLoginButton } from "./TwitterLoginButton";

import * as GetTweetsApi from "../common/getTweetsApi";
import { Tweet } from "../tweetModels/Tweet";

interface Props {
    /** Current state of the app. */
    appState: AppState;

    /** Error info to render if the app is in an error state. */
    errorInfo?: ErrorInfo;

    /** Callback for when an attempt to fetch tweets starts. */
    onTweetPromise: (tweetPromise: Promise<Tweet[]>) => void;

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
    const {appState, errorInfo, onTweetPromise, onLoginError} = props;
    const handleAuthToken = (token: GetTweetsApi.RequestQueryParams) => {
        const tweetPromise = axios.request<GetTweetsApi.ResponsePayload>({
            method: GetTweetsApi.METHOD,
            baseURL: GetTweetsApi.PATH,
            params: token
        }).then(response => Tweet.fromStatuses(response.data.tweets))
        onTweetPromise(tweetPromise);
    }

    const loginButton = <TwitterLoginButton onAuthToken={handleAuthToken} onError={onLoginError} />;
    switch (appState) {
        case AppState.START:
            return <InstructionsAndButton buttonElement={loginButton} />;
        case AppState.ERROR:
            return <InstructionsAndButton errorInfo={errorInfo} buttonElement={loginButton} />;
        default:
            return null;
    }
}
