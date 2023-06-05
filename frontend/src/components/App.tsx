import React from "react";
import querystring from "querystring";
import randomstring from "randomstring";

import { AppState, ErrorInfo, FailedAction } from "./AppState";
import { useTimer } from "./useTimer";
import { TwitterLoginFlow } from "./introFlows/TwitterLoginFlow";
import { StaticTweetFlow } from "./introFlows/StaticTweetFlow";
import { EndScreen } from "./EndScreen";
import { InstructionsModal } from "./InstructionsModal";
import { TweetView } from "./tweetViewing/TweetView";

import { ExperimentalCondition } from "../common/ExperimentalCondition";
import { fetchExperimentalCondition } from "../fetchExperimentalCondition";
import { ApiErrorHandler } from "../ApiErrorHandler";
import { ParticipantLog } from "../ParticipantLog";
import { Tweet } from "../tweetModels/Tweet";

import spinner from "../loading-small.gif";
import "./App.css";

import * as GetTweetsApi from "../common/getTweetsApi";
import axios from "axios";


/** How much time users have to view their Tweets before they disappear. */
const TWEET_VIEW_DURATION_SECONDS = Number.parseInt(process.env.REACT_APP_FEED_VIEWING_SECONDS || "", 10);
if (!isFinite(TWEET_VIEW_DURATION_SECONDS)) {
    throw new Error("Invalid value for REACT_APP_FEED_VIEWING_SECONDS environment variable.");
}

// substring(1) cuts off the "?" in the URL query string
const parsedQueryParams = querystring.parse(window.location.search.substring(1));

async function generateCodeChallenge(codeVerifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    const base64Digest = window.btoa(String.fromCharCode(...new Uint8Array(digest)));
    // you can extract this replacing code to a function
    return base64Digest
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

async function constructAuthUrl() {
    const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", "am9hR3Exdms1V2xkTFoxaFZwams6MTpjaQ");
    authUrl.searchParams.set("redirect_uri", "http://127.0.0.1:3000");
    authUrl.searchParams.set("state", "mytest");
    const codeVerifier = randomstring.generate(128);
    window.sessionStorage.setItem("code_verifier", codeVerifier);
    const code_challenge = await generateCodeChallenge(codeVerifier);
    authUrl.searchParams.set("code_challenge", code_challenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("scope", "tweet.read users.read");
    return authUrl.toString();
}


export function App() {
    const log = React.useMemo(() => new ParticipantLog(), []);
    const topBar = React.useRef<HTMLDivElement>(null);

    ////////////////////////
    // State and handlers //
    ////////////////////////
    const [appState, setAppState] = React.useState<AppState>(() =>
        localStorage.getItem(log.qualtricsID) === "done" ? AppState.ENDED : AppState.START
    );
    const [isUsingStaticTweets, setIsUsingStaticTweets] = React.useState(
        () => parsedQueryParams["use_static_tweets"] === "true"
    );
    const [isEnding, setIsEnding] = React.useState(false);
    const [isShowingInstructions, setIsShowingInstructions] = React.useState(false);
    const [tweets, setTweets] = React.useState<Tweet[]>([]);
    const [experimentCondition, setExperimentCondition] = React.useState<ExperimentalCondition>(
        ExperimentalCondition.UNKNOWN
    );
    const [errorInfo, setErrorInfo] = React.useState<ErrorInfo | undefined>(undefined);
    const {timeLeftSeconds, startTimerAfterNextUpdate, pauseTimer} = useTimer(TWEET_VIEW_DURATION_SECONDS);
    const [topBarHeight, setTopBarHeight] = React.useState(0);

    function makeErrorHandler(failedAction: FailedAction) {
        return function(error: unknown) {
            setAppState(AppState.ERROR);
            setErrorInfo( {failedAction, cause: new ApiErrorHandler().getErrorReason(error)} );
        }
    }
    const handleLoginError = makeErrorHandler(FailedAction.LOGIN);
    const handleFetchError = makeErrorHandler(FailedAction.FETCH);
    // This is a pretty important callback; it's called for both the Twitter login flow and the static tweet flow.
    async function handleTweetPromise(tweetPromise: Promise<Tweet[]>) {
        setAppState(AppState.LOADING);
        try {
            const tweets = await tweetPromise;
            const fetchedCondition = await fetchExperimentalCondition();
            log.experimentalCondition = fetchedCondition;
            setTweets(tweets);
            setExperimentCondition(fetchedCondition);
            setAppState(AppState.LOADED);
            setIsShowingInstructions(true);
        } catch (error) {
            handleFetchError(error);
        }
    }

    /////////////
    // Effects //
    /////////////
    React.useEffect(() => { // Upload participant log when time is up
        if (timeLeftSeconds <= 0) {
            setIsEnding(true);
            // FIXME the actual transition duration is specified in EndScreen.css right now.
            window.setTimeout(() => setAppState(AppState.ENDED), 2000);
            localStorage.setItem(log.qualtricsID, "done");
            log.uploadEnsuringOnce()
                .catch(console.error);
        }
    }, [timeLeftSeconds, log]);
    React.useEffect(() => { // Keep track of top bar's height
        setTopBarHeight(topBar.current !== null ? topBar.current.offsetHeight : 0);
    }, [timeLeftSeconds]);
    // Run it when timeLeftSeconds changes, because that's when we might add the notification that resizes the top bar.

    const [redirectUrl, setRedirectUrl] = React.useState("");
    React.useEffect(() => {
        if (typeof parsedQueryParams["code"] == "string") {
            const code_verifier = window.sessionStorage.getItem("code_verifier");
            if (!code_verifier) {
                console.error("No Code Verifier!");
                return;
            }
            const body: GetTweetsApi.RequestBody = {
                code: parsedQueryParams["code"],
                code_verifier
            };

            axios.request({
                url: GetTweetsApi.PATH,
                method: GetTweetsApi.METHOD,
                headers: {
                    "Content-Type": "application/json",
                    "Accept-Encoding": "gzip"
                },
                data: JSON.stringify(body),
                responseType: "json"
            }).then(console.log).catch(console.error);
        } else {
            constructAuthUrl().then(setRedirectUrl);
        }

    }, [])
    return <a href={redirectUrl}>GO!</a>;

    ///////////////////////////
    // The actual rendering! //
    ///////////////////////////
    let tweetFetchFlow;
    if (isUsingStaticTweets) {
        tweetFetchFlow = <StaticTweetFlow
            appState={appState}
            errorInfo={errorInfo}
            log={log}
            onTweetPromise={handleTweetPromise}
        />;
    } else {
        tweetFetchFlow = <TwitterLoginFlow
            appState={appState}
            errorInfo={errorInfo}
            onTweetPromise={handleTweetPromise}
            onLoginError={handleLoginError}
            onAlternativeRequested={() => setIsUsingStaticTweets(true)}
        />;
    }

    let mainContent;
    switch (appState) {
        case AppState.LOADING:
            mainContent = <div className="vertical-and-horiz-center">
                <div>Loading your Tweets... <img src={spinner} alt="Loading" /></div>
            </div>;
            break;
        case AppState.LOADED:
            mainContent = <TweetView
                tweets={tweets}
                experimentCondition={experimentCondition}
                settingsYOffset={topBarHeight}
                log={log}
            />;
            break;
        default:
            mainContent = null;
    }

    return <div>
        <div className="sticky-top" ref={topBar} >
            <nav className="navbar">
                <span className="navbar-brand">Custom Twitter Viewer</span>
                {appState === AppState.LOADED &&
                    <button
                        className="btn btn-sm btn-light"
                        onClick={() => { setIsShowingInstructions(true); pauseTimer(); }}
                    >
                        Help
                    </button>
                }
            </nav>
        </div>

        {tweetFetchFlow}
        {mainContent}
        <InstructionsModal
            viewingDuration={TWEET_VIEW_DURATION_SECONDS}
            open={isShowingInstructions}
            onClose={() => { setIsShowingInstructions(false); startTimerAfterNextUpdate(); }}
        />
        {(isEnding || appState === AppState.ENDED) && <EndScreen />}
    </div>;
}
