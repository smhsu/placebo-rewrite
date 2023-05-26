import React from "react";
import axios from "axios";
import querystring from "querystring";

import { AppState, ErrorInfo } from "../AppState";
import { TwitterLoginButton } from "./TwitterLoginButton";
import { ErrorDisplay } from "./ErrorDisplay";

import * as GetTweetsApi from "../../common/getTweetsApi";
import { Tweet } from "../../tweetModels/Tweet";

import "./TwitterLoginFlow.css";

interface Props {
    /** Current state of the app. */
    appState: AppState;

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
    const {appState, errorInfo, onTweetPromise, onLoginError, onAlternativeRequested} = props;
    const [isWorking, setIsWorking] = React.useState(false);

    const hasTriedFetching = React.useRef(false);
    React.useEffect(() => {
        if (hasTriedFetching.current) {
            return;
        }

        const queryParams = querystring.parse(window.location.search.substring(1));
        const getTweetsParams = false;
        if (getTweetsParams) {
            hasTriedFetching.current = true;
            const paramsAsString = JSON.stringify(getTweetsParams);
            if (window.localStorage.getItem("expiredOAuthToken") === paramsAsString) {
                return; // This is expired, we can't use it.
            }
            window.localStorage.setItem("expiredOAuthToken", paramsAsString);

            const tweetPromise = axios.request<GetTweetsApi.ResponsePayload>({
                method: GetTweetsApi.METHOD,
                baseURL: GetTweetsApi.PATH,
                params: getTweetsParams
            }).then(response => Tweet.fromStatuses(response.data.tweets))
            onTweetPromise(tweetPromise);
        }
    }, [onTweetPromise]);


    const optionsGrid = <div className="TwitterLoginFlow-options-grid">
        <TwitterLoginButton
            className="TwitterLoginFlow-button"
            isWorking={isWorking}
            onSetWorking={setIsWorking}
            onError={onLoginError}
        />
        <div>
            This will take you to Twitter's website.  To cancel log in, use your web browser's BACK button or feature.
        </div>
        <button className="btn btn-light TwitterLoginFlow-button" disabled={isWorking} onClick={onAlternativeRequested}>
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
