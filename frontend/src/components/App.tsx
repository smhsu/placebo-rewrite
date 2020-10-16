import React from "react";
import querystring from "querystring";
import { Status } from "twitter-d";

import { useTweetFetch } from "./useTweetFetch";
import * as GetTweetsApi from "../common/getTweetsApi";
import { useTimer } from "./useTimer";
import { TweetView } from "./TweetView";
import { LoginPane } from "./LoginPane";
import { TopicPicker } from "./TopicPicker";

import { ApiErrorHandler } from "../ApiErrorHandler";
import { ParticipantLog } from "../ParticipantLog";
import { TimeParsedTweet, addTimeData } from "../TimeParsedTweet";

import spinner from "../loading-small.gif";
import "./App.css";

/** How much time users have to view their Tweets before they disappear. */
const TWEET_VIEW_DURATION_SECONDS = Number.POSITIVE_INFINITY;

/** How long of a warning users will get that their Tweets will be disappearing. */
const TWEET_DISAPPEAR_WARNING_SECONDS = 10;

enum AppState {
    LOGIN_SCREEN,
    TOPIC_PICKER,
    LOADING,
    LOADED,
    ERROR
}

enum ErrorCause {
    LOGIN_ERROR = "Login request failed.",
    FETCH_ERROR = "Couldn't fetch your tweets."
}

interface ErrorInfo {
    cause: ErrorCause;
    details: string;
}

function getQueryParams() {
    // substring(1) cuts off the "?" in the URL query string
    return querystring.parse(window.location.search.substring(1));
}

function getInitialAppState(params: querystring.ParsedUrlQuery): AppState {
    if (params["use_static_tweets"] === "true") {
        return AppState.TOPIC_PICKER;
    } else if (GetTweetsApi.extractQueryParams(params) !== null) {
        return AppState.LOADING;
    } else {
        return AppState.LOGIN_SCREEN;
    }
}

export function App() {
    const log = React.useRef(new ParticipantLog());
    const topBar = React.useRef<HTMLDivElement>(null);
    const parsedQueryParams = React.useRef(getQueryParams());
    const handleApiError = React.useCallback((cause: ErrorCause, error: unknown) => {
        setError({
            cause,
            details: new ApiErrorHandler().getTwitterApiErrorReason(error)
        });
    }, []);

    ///////////
    // State //
    ///////////
    const [appState, setAppState] = React.useState<AppState>(() => getInitialAppState(parsedQueryParams.current));
    const [tweets, setTweets] = React.useState<TimeParsedTweet[]>([]);
    const [error, setError] = React.useState<ErrorInfo | null>(null);
    const {timeLeftSeconds, startTimer} = useTimer(TWEET_VIEW_DURATION_SECONDS);
    const [topBarHeight, setTopBarHeight] = React.useState(0);
    const handleTweets = React.useCallback((tweets: Status[]) => {
        setTweets(addTimeData(tweets));
        setAppState(AppState.LOADED);
        startTimer();
    }, [setTweets, startTimer]);


    /////////////
    // Effects //
    /////////////
    useTweetFetch(GetTweetsApi.extractQueryParams(parsedQueryParams.current), {
        onFetchSuccess: handleTweets,
        onError: error => handleApiError(ErrorCause.FETCH_ERROR, error)
    });

    React.useEffect(() => { // Upload participant log when time is up
        if (timeLeftSeconds <= 0) {
            try {
                log.current.uploadEnsuringOnce();
            } catch (error) {
                console.error(error);
            }
        }
    }, [timeLeftSeconds]);

    React.useEffect(() => { // Keep track of top bar's height
        setTopBarHeight(topBar.current !== null ? topBar.current.offsetHeight : 0);
    }, [timeLeftSeconds]);
    // Run it when timeLeftSeconds changes, because that's when we might add the notification that resizes the top bar.


    ///////////////////////////
    // The actual rendering! //
    ///////////////////////////
    let mainContent = null;
    switch (appState) {
        case AppState.LOGIN_SCREEN:
        case AppState.ERROR:
            mainContent = <LoginPane
                mainErrorMessage={error?.cause}
                errorReason={error?.details}
                onError={error => handleApiError(ErrorCause.LOGIN_ERROR, error)}
            />;
            break;
        case AppState.TOPIC_PICKER:
            mainContent = <TopicPicker onTweets={handleTweets} />
            break;
        case AppState.LOADING:
            mainContent = <div className="vertical-and-horiz-center">
                <div>Loading your Tweets... <img src={spinner} alt="Loading" /></div>
            </div>;
            break;
        case AppState.LOADED:
        default:
            mainContent = <TweetView
                tweets={tweets}
                settingsYOffset={topBarHeight + 10}
                log={log.current}
            />;
    }

    return <div>
        <div className="sticky-top" ref={topBar} >
            <nav className="navbar">
                <span className="navbar-brand">Custom Twitter Viewer</span>
            </nav>
            {timeLeftSeconds <= TWEET_DISAPPEAR_WARNING_SECONDS && // Warning that Tweets will disappear soon
                <div className="alert alert-warning App-tweet-disappear-warning">
                    <span role="img" aria-label="warning">⚠️</span> Tweets will disappear
                    in {Math.max(0, timeLeftSeconds)} seconds.
                </div>
            }
        </div>

        {mainContent}

        {timeLeftSeconds <= 0 && // End screen
            <div className="App-hide-tweet-overlay vertical-center">
                <div className="container">
                    <h1>Thanks for browsing!</h1>
                    <p>Please enter this code to continue inside Qualtrics: <code>lots of tweets</code></p>
                </div>
            </div>
        }
    </div>;
}
