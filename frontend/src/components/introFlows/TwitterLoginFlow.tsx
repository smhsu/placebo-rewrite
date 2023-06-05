import React from "react";
import axios from "axios";

import { AppState, ErrorInfo } from "../AppState";
import { TwitterLoginButton } from "./TwitterLoginButton";
import { ErrorDisplay } from "./ErrorDisplay";
import { deleteAuthVerifiers, getStoredAuthVerifiers } from "./OAuth2Utils";

import * as GetTweetsApi from "../../common/getTweetsApi";
import { Tweet } from "../../tweetModels/Tweet";

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

    /**
     * Detects if the user has authorized our app, and if so, fetches their tweets.
     */
    React.useEffect(() => {
        // If the user has authorized our app, Twitter will redirect to our website with the code and state parameters
        // in the URL.  See https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token
        if (urlParams.has("code") && urlParams.has("state")) {
            const verifiers = getStoredAuthVerifiers();
            if (verifiers.state === urlParams.get("state")) {
                const body: GetTweetsApi.RequestBody = {
                    code: urlParams.get("code") || "",
                    code_verifier: verifiers.code_verifier || ""
                };

                // This will prevent us from trying to use the verifiers more than once, as they only work once.
                deleteAuthVerifiers();

                onTweetPromise(axios.request({
                    url: GetTweetsApi.PATH,
                    method: GetTweetsApi.METHOD,
                    data: body,
                    responseType: "json"
                }).then(response => response.data));
            }
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
