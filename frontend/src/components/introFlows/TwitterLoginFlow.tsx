import React from "react";

import { AppState, ErrorInfo } from "../AppState";
import { TwitterLoginButton } from "./TwitterLoginButton";
import { ErrorDisplay } from "./ErrorDisplay";
import { Tweet } from "../../tweetModels/Tweet";
import { callTweetsApi, getCachedApiResponse } from "../../apiLogic/callTweetsApi";

import "./TwitterLoginFlow.css";

interface Props {
    /** Current state of the app. */
    appState: AppState;

    /** Can contain the authorization code to download Tweets. */
    urlParams: URLSearchParams;

    /** Error info to render if the app is in an error state. */
    errorInfo?: ErrorInfo;

    /** Callback for when an attempt to fetch tweets starts. */
    onTweetPromise: (tweetPromise: Promise<Tweet[]>) => void;

    /** Callback for errors that happen when trying to log in. */
    onLoginError: (error: unknown) => void;
    onAlternativeRequested: () => void;
}

/**
 * Renders an interface for users to authorize our app with Twitter.  Automatically fetches tweets if valid
 * authentication information is detected inside the `queryParams` prop.
 *
 * @author Silas Hsu
 */
export function TwitterLoginFlow(props: Props) {
    const {appState, urlParams, errorInfo, onTweetPromise, onAlternativeRequested} = props;

    const hasEffectRun = React.useRef(false);
    /**
     * Detects if the user has authorized our app, and if so, fetches their tweets.
     */
    React.useEffect(() => {
        if (hasEffectRun.current) {
            return;
        }
        hasEffectRun.current = true;

        const apiResponse = getCachedApiResponse();
        if (apiResponse) {
            onTweetPromise(Promise.resolve(Tweet.fromApiData(apiResponse)));
            return;
        }

        const apiPromise = callTweetsApi(urlParams);
        if (apiPromise) {
            onTweetPromise(apiPromise.then(Tweet.fromApiData));
        }
    }, [urlParams, onTweetPromise]);

    const optionsGrid = <div className="TwitterLoginFlow-options-grid">
        <TwitterLoginButton className="TwitterLoginFlow-button" />
        <div>
            This will take you to Twitter's website.  To cancel log in, use your web browser's BACK button or feature.
        </div>
        <button className="btn btn-light TwitterLoginFlow-button" onClick={onAlternativeRequested}>
            Alternative app...
        </button>
        <div>Use this option if you've changed your mind about logging in.</div>
    </div>;

    switch (appState) {
        case AppState.START:
            return <div className="container vertical-center">
                <p className="TwitterLoginFlow-heading"><b>Welcome!</b> Click below to get started.</p>
                {optionsGrid}
            </div>;
        case AppState.ERROR:
            return <div className="container vertical-center">
                {errorInfo && <ErrorDisplay errorInfo={errorInfo} />}
                {optionsGrid}
            </div>
        default:
            return null;
    }
}
