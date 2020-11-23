import React from "react";
import querystring from "querystring";

import { AppState, ErrorInfo, FailedAction } from "./AppState";
import { useTimer } from "./useTimer";
import { TwitterLoginFlow } from "./TwitterLoginFlow";
import { StaticTweetFlow } from "./StaticTweetFlow";
import { TweetView } from "./tweetViewing/TweetView";

import { AugmentedTweet } from "../AugmentedTweet";
import { fetchExperimentalCondition } from "../fetchExperimentalCondition";
import { ApiErrorHandler } from "../ApiErrorHandler";
import { ParticipantLog } from "../ParticipantLog";
import { ExperimentalCondition } from "../common/ExperimentalCondition";

import spinner from "../loading-small.gif";
import "./App.css";

/** How much time users have to view their Tweets before they disappear. */
const TWEET_VIEW_DURATION_SECONDS = Number.POSITIVE_INFINITY;

/** How long of a warning users will get that their Tweets will be disappearing. */
const TWEET_DISAPPEAR_WARNING_SECONDS = 10;

// substring(1) cuts off the "?" in the URL query string
const parsedQueryParams = querystring.parse(window.location.search.substring(1));

export function App() {
    const log = React.useRef(new ParticipantLog());
    const topBar = React.useRef<HTMLDivElement>(null);
    const isUsingStaticTweets = parsedQueryParams["use_static_tweets"] === "true";

    ////////////////////////
    // State and handlers //
    ////////////////////////
    const [appState, setAppState] = React.useState<AppState>(AppState.START);
    const [tweets, setTweets] = React.useState<AugmentedTweet[]>([]);
    const [experimentCondition, setExperimentCondition] = React.useState<ExperimentalCondition>(
        ExperimentalCondition.UNKNOWN
    );
    const [errorInfo, setErrorInfo] = React.useState<ErrorInfo | undefined>(undefined);
    const {timeLeftSeconds, startTimer} = useTimer(TWEET_VIEW_DURATION_SECONDS);
    const [topBarHeight, setTopBarHeight] = React.useState(0);

    function makeErrorHandler(failedAction: FailedAction) {
        return function(error: unknown) {
            setAppState(AppState.ERROR);
            setErrorInfo( {failedAction, cause: new ApiErrorHandler().getErrorReason(error)} );
        }
    }
    const handleLoginError = makeErrorHandler(FailedAction.LOGIN);
    const handleFetchError = makeErrorHandler(FailedAction.FETCH);
    async function handleTweetPromise(tweetPromise: Promise<AugmentedTweet[]>) {
        setAppState(AppState.LOADING);
        try {
            const tweets = await tweetPromise;
            const fetchedCondition = await fetchExperimentalCondition();
            log.current.experimentalCondition = fetchedCondition;
            setTweets(tweets);
            setExperimentCondition(fetchedCondition);
            setAppState(AppState.LOADED);
            startTimer();
        } catch (error) {
            handleFetchError(error);
        }
    }

    /////////////
    // Effects //
    /////////////
    React.useEffect(() => { // Upload participant log when time is up
        if (timeLeftSeconds <= 0) {
            log.current.uploadEnsuringOnce()
                .catch(console.error);
        }
    }, [timeLeftSeconds]);
    React.useEffect(() => { // Keep track of top bar's height
        setTopBarHeight(topBar.current !== null ? topBar.current.offsetHeight : 0);
    }, [timeLeftSeconds]);
    // Run it when timeLeftSeconds changes, because that's when we might add the notification that resizes the top bar.

    ///////////////////////////
    // The actual rendering! //
    ///////////////////////////
    let tweetFetchFlow = null;
    if (isUsingStaticTweets) {
        tweetFetchFlow = <StaticTweetFlow
            appState={appState}
            errorInfo={errorInfo}
            onTweetPromise={handleTweetPromise}
        />;
    } else {
        tweetFetchFlow = <TwitterLoginFlow
            appState={appState}
            errorInfo={errorInfo}
            queryParams={parsedQueryParams}
            onTweetPromise={handleTweetPromise}
            onLoginError={handleLoginError}
        />;
    }

    let mainContent = null;
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
                log={log.current}
            />;
            break;
        default:
            mainContent = null;
    }

    return <div>
        <div className="sticky-top" ref={topBar} >
            <nav className="navbar">
                <span className="navbar-brand">Custom Twitter Viewer</span>
            </nav>
            {timeLeftSeconds <= TWEET_DISAPPEAR_WARNING_SECONDS && <LowTimeWarning timeLeftSeconds={timeLeftSeconds} />}
        </div>

        {tweetFetchFlow}
        {mainContent}
        {timeLeftSeconds <= 0 && <EndScreen />}
    </div>;
}

function LowTimeWarning(props: {timeLeftSeconds: number}) {
    return <div className="alert alert-warning App-tweet-disappear-warning">
        <span role="img" aria-label="warning">⚠️</span> Tweets will disappear
        in {Math.max(0, props.timeLeftSeconds)} seconds.
    </div>;
}

function EndScreen() {
    return <div className="App-hide-tweet-overlay vertical-center">
        <div className="container">
            <h1>Thanks for browsing!</h1>
            <p>Please enter this code to continue inside Qualtrics: <code>lots of tweets</code></p>
        </div>
    </div>;
}
