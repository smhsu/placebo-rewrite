import React from "react";
import querystring from "querystring";

import { AppState, ErrorInfo, FailedAction } from "./AppState";
import { useTimer } from "./useTimer";
import { TwitterLoginFlow } from "./TwitterLoginFlow";
import { StaticTweetFlow } from "./StaticTweetFlow";
import { TweetView } from "./tweetViewing/TweetView";

import { ExperimentalCondition } from "../common/ExperimentalCondition";
import { fetchExperimentalCondition } from "../fetchExperimentalCondition";
import { ApiErrorHandler } from "../ApiErrorHandler";
import { ParticipantLog } from "../ParticipantLog";
import { Tweet } from "../tweetModels/Tweet";
import { getIsUsingStaticTweets } from "../staticTweetsSwitch";

import spinner from "../loading-small.gif";
import "./App.css";

/** How much time users have to view their Tweets before they disappear. */
const TWEET_VIEW_DURATION_SECONDS = Number.parseInt(process.env.REACT_APP_FEED_VIEWING_SECONDS || "", 10);
if (!isFinite(TWEET_VIEW_DURATION_SECONDS)) {
    throw new Error("Invalid value for REACT_APP_FEED_VIEWING_SECONDS environment variable.");
}

// substring(1) cuts off the "?" in the URL query string
const parsedQueryParams = querystring.parse(window.location.search.substring(1));

export function App() {
    const log = React.useMemo(() => new ParticipantLog(), []);
    const topBar = React.useRef<HTMLDivElement>(null);

    ////////////////////////
    // State and handlers //
    ////////////////////////
    const [appState, setAppState] = React.useState<AppState>(AppState.START);
    const [tweets, setTweets] = React.useState<Tweet[]>([]);
    const [experimentCondition, setExperimentCondition] = React.useState<ExperimentalCondition>(
        ExperimentalCondition.UNKNOWN
    );
    const [errorInfo, setErrorInfo] = React.useState<ErrorInfo | undefined>(undefined);
    const {timeLeftSeconds, startTimerAfterNextUpdate} = useTimer(TWEET_VIEW_DURATION_SECONDS);
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
            log.logTweetStatistics(tweets);
            log.experimentalCondition = fetchedCondition;
            setTweets(tweets);
            setExperimentCondition(fetchedCondition);
            setAppState(AppState.LOADED);
            startTimerAfterNextUpdate();
        } catch (error) {
            handleFetchError(error);
        }
    }

    /////////////
    // Effects //
    /////////////
    React.useEffect(() => { // Upload participant log when time is up
        if (timeLeftSeconds <= 0) {
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
    if (getIsUsingStaticTweets(parsedQueryParams)) {
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
                <span className="navbar-scroll-instructions">Scroll INSIDE this window to see more of the feed.</span>
            </nav>
        </div>

        {tweetFetchFlow}
        {mainContent}
        {timeLeftSeconds <= 0 && <EndScreen />}
    </div>;
}

function EndScreen() {
    return <div className="App-hide-tweet-overlay vertical-center">
        <div className="container">
            <h1>Thanks for browsing!</h1>
            <p>
                Please enter this code to continue inside Qualtrics: <code>{process.env.REACT_APP_CONTINUE_CODE}</code>
            </p>
        </div>
    </div>;
}
