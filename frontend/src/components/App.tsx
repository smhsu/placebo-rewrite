import React from "react";
import { Status } from "twitter-d";
import { LoginAndTweetLoader } from "./LoginAndTweetLoader";
import { TweetView } from "./TweetView";
import { ParticipantLog } from "../ParticipantLog";

import sampleTweets from "../sampleTweets.json";
import "./App.css";

/** For debugging purposes.  Setting this to `true` skips the login flow and loads a static set of Tweets. */
const IS_USING_STATIC_TWEETS = true;

/** How much time users have to view their Tweets before they disappear. */
const TWEET_VIEW_DURATION_SECONDS = 10;

/** How long of a warning users will get that their Tweets will be disappearing. */
const TWEET_DISAPPEAR_WARNING_SECONDS = 5;

interface State {
    /** Tweets to display.  If null, Tweets have not been loaded yet. */
    tweets: Readonly<Status>[] | null;

    /** Time left to view Tweets. */
    timeLeftSeconds: number;

    settingsYOffset: number;
}

export class App extends React.Component<{}, State> {
    private _timerID?: number;
    private _topBar: React.RefObject<HTMLDivElement>;
    private _log: ParticipantLog;

    constructor(props: {}) {
        super(props);
        this.state = {
            tweets: null,
            timeLeftSeconds: Number.POSITIVE_INFINITY,
            settingsYOffset: 0
        };

        this._topBar = React.createRef();
        this._log = new ParticipantLog();
        this.handleTweetsFetched = this.handleTweetsFetched.bind(this);
    }

    componentDidMount() {
        if (IS_USING_STATIC_TWEETS) {
            this.handleTweetsFetched(sampleTweets as unknown as Status[]);
        }
    }

    handleTweetsFetched(tweets: Status[]) {
        this.setState({
            tweets,
            timeLeftSeconds: TWEET_VIEW_DURATION_SECONDS
        });

        this._timerID = window.setInterval(() => {
            this.setState(prevState => {
                const newTimeLeft = prevState.timeLeftSeconds - 1;
                if (newTimeLeft <= 0) {
                    window.clearInterval(this._timerID);
                }
                return { timeLeftSeconds: newTimeLeft };
            });
        }, 1000);
    }

    componentWillUnmount() {
        window.clearInterval(this._timerID);
    }

    componentDidUpdate() {
        /** Measure top bar height */
        const topBarHeight = this._topBar.current ? this._topBar.current.offsetHeight : 0;
        const settingsYOffset = topBarHeight + 10;
        if (this.state.settingsYOffset !== settingsYOffset) {
            this.setState({ settingsYOffset: settingsYOffset });
        }

        /** Upload participant log */
        if (this.state.timeLeftSeconds <= 0) {
            try {
                this._log.uploadEnsuringOnce();
            } catch (error) {
                console.error(error);
            }
        }
    }

    render() {
        const { tweets, timeLeftSeconds } = this.state;
        return <div>
            <div className="sticky-top" ref={this._topBar} >
                <nav className="navbar">
                    <span className="navbar-brand">Custom Twitter Viewer</span>
                </nav>
                {timeLeftSeconds <= TWEET_DISAPPEAR_WARNING_SECONDS &&
                    <div className="alert alert-warning App-tweet-disappear-warning">
                        <span role="img" aria-label="warning">⚠️</span> Tweets will disappear
                        in {Math.max(0, timeLeftSeconds)} seconds.
                    </div>
                }
            </div>

            {tweets === null ?
                <LoginAndTweetLoader onTweetsFetched={this.handleTweetsFetched} />
                :
                <TweetView tweets={tweets} settingsYOffset={this.state.settingsYOffset} log={this._log} />
            }

            {timeLeftSeconds <= 0 &&
                <div className="App-hide-tweet-overlay vertical-center">
                    <div className="container">
                        <h1>Thanks for browsing!</h1>
                        <p>Please enter this code to continue inside Qualtrics: <code>lots of tweets</code></p>
                    </div>
                </div>
            }
        </div>;
    }
}
