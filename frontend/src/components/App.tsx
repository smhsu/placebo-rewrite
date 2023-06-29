import React from "react";

import { AppState, ErrorInfo, FailedAction } from "./AppState";
import { useTimer } from "./useTimer";
import { TwitterLoginFlow } from "./introFlows/TwitterLoginFlow";
import { StaticTweetFlow } from "./introFlows/StaticTweetFlow";
import { EndScreen } from "./EndScreen";
import { InstructionsModal } from "./InstructionsModal";
import { TweetView } from "./tweetViewing/TweetView";

import { ExperimentalCondition, parseCondition } from "../common/ExperimentalCondition";
import { ApiErrorHandler } from "../apiLogic/ApiErrorHandler";
import { ParticipantLog } from "../ParticipantLog";
import { Tweet } from "../tweetModels/Tweet";

import spinner from "../loading-small.gif";
import "./App.css";

/** How much time users have to view their Tweets before they disappear. */
const TWEET_VIEW_DURATION_SECONDS = Number.parseInt(process.env.REACT_APP_FEED_VIEWING_SECONDS || "", 10);
if (!isFinite(TWEET_VIEW_DURATION_SECONDS)) {
    throw new Error("Invalid value for REACT_APP_FEED_VIEWING_SECONDS environment variable.");
}

const urlParams = new URLSearchParams(window.location.search);
let condition = urlParams.get("condition");
if (condition) {
    localStorage.setItem("condition", condition);
} else {
    condition = localStorage.getItem("condition");
}

export function App() {
    const log = React.useMemo(() => new ParticipantLog(urlParams), []);
    const topBar = React.useRef<HTMLDivElement>(null);

    ////////////////////////
    // State and handlers //
    ////////////////////////
    const [appState, setAppState] = React.useState<AppState>(AppState.START);
    const [isUsingStaticTweets, setIsUsingStaticTweets] = React.useState(
        () => urlParams.get("use_static_tweets") === "true" && process.env.NODE_ENV === "development"
    );
    const [isEnding, setIsEnding] = React.useState(false);
    const [isShowingInstructions, setIsShowingInstructions] = React.useState(false);
    const [tweets, setTweets] = React.useState<Tweet[]>([]);
    const experimentCondition = React.useMemo<ExperimentalCondition>(
        () => parseCondition(condition || ""), []
    );
    const [errorInfo, setErrorInfo] = React.useState<ErrorInfo | undefined>(undefined);
    const {timeLeftSeconds, startTimerAfterNextUpdate, pauseTimer} = useTimer(TWEET_VIEW_DURATION_SECONDS);
    const [topBarHeight, setTopBarHeight] = React.useState(0);

    function switchToStaticTweets() {
        setAppState(AppState.START);
        setIsUsingStaticTweets(true);
    }

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
            log.experimentalCondition = experimentCondition;
            setTweets(tweets);
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
            log.uploadEnsuringOnce()
                .catch(console.error);
        }
    }, [timeLeftSeconds, log]);
    React.useEffect(() => { // Keep track of top bar's height
        setTopBarHeight(topBar.current !== null ? topBar.current.offsetHeight : 0);
    }, [timeLeftSeconds]);
    // Run it when timeLeftSeconds changes, because that's when we might add the notification that resizes the top bar.

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
            urlParams={urlParams}
            errorInfo={errorInfo}
            onTweetPromise={handleTweetPromise}
            onLoginError={handleLoginError}
            onAlternativeRequested={switchToStaticTweets}
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
        {(isEnding || appState === AppState.ENDED) && <EndScreen condition={experimentCondition} />}
    </div>;
}
