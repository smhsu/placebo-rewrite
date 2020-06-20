import React from "react";

import { useTweetFetchOnMount } from "./useTweetFetchOnMount";
import { useTimer } from "./useTimer";
import { TweetView } from "./TweetView";
import { LoginPane } from "./LoginPane";

import { ApiErrorHandler } from "../ApiErrorHandler";
import { ParticipantLog } from "../ParticipantLog";

import spinner from "../loading-small.gif";
import "./App.css";

/** How much time users have to view their Tweets before they disappear. */
const TWEET_VIEW_DURATION_SECONDS = Number.POSITIVE_INFINITY;

/** How long of a warning users will get that their Tweets will be disappearing. */
const TWEET_DISAPPEAR_WARNING_SECONDS = 10;

enum ErrorCause {
    LOGIN_ERROR = "Login request failed.",
    FETCH_ERROR = "Couldn't fetch your tweets."
}

interface ErrorState {
    cause: ErrorCause | "";
    details: string;
}

export function App() {
    const log = React.useRef(new ParticipantLog());
    const topBar = React.useRef<HTMLDivElement>(null);

    ///////////////////
    // Lots of state //
    ///////////////////
    const [error, setError] = React.useState<ErrorState>({
        cause: "",
        details: ""
    });
    const {timeLeftSeconds, startTimer} = useTimer(TWEET_VIEW_DURATION_SECONDS);
    const [topBarHeight, setTopBarHeight] = React.useState(0);
    const {tweets, isLoading} = useTweetFetchOnMount({
        onError: error => {
            handleApiError(ErrorCause.FETCH_ERROR, error);
        },
        onFetchSuccess: () => {
            setError({
                cause: "",
                details: ""
            });
            startTimer();
        }
    });

    const handleApiError = React.useCallback((cause: ErrorCause, error: any) => {
        setError({
            cause,
            details: new ApiErrorHandler().getTwitterApiErrorReason(error)
        });
    }, []);

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
        setTopBarHeight(topBar.current ? topBar.current.offsetHeight : 0);
    }, [timeLeftSeconds]);
    // Run it when timeLeftSeconds changes, because that's when we might add the notification that resizes the top bar.

    let mainContent = null;
    if (isLoading) {
        mainContent = <div className="vertical-and-horiz-center">
            <div>Loading your Tweets... <img src={spinner} alt="Loading" /></div>
        </div>;
    } else if (tweets === null) {
        mainContent = <LoginPane
            mainErrorMessage={error.cause}
            errorReason={error.details}
            onError={error => handleApiError(ErrorCause.LOGIN_ERROR, error)}
        />;
    } else {
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
