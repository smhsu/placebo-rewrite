import React from "react";
import { Status } from "twitter-d";
import { LoginAndTweetLoader } from "./LoginAndTweetLoader";
import { TweetView } from "./TweetView";

import sampleTweets from "../sampleTweets.json";
import "./App.css";

/** For debugging purposes.  Setting this to `true` skips the login flow and loads a static set of Tweets. */
const IS_USING_STATIC_TWEETS = false;

/** How much time users have to view their Tweets before they disappear. */
const TWEET_VIEW_DURATION_SECONDS = 15;

/** How long of a warning users will get that their Tweets will be disappearing. */
const TWEET_DISAPPEAR_WARNING_SECONDS = 10;

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

    constructor(props: {}) {
        super(props);
        this.state = {
            tweets: null,
            timeLeftSeconds: Number.POSITIVE_INFINITY,
            settingsYOffset: 0
        };

        this._topBar = React.createRef();
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
                return { timeLeftSeconds: prevState.timeLeftSeconds - 1 };
            });
        }, 1000);
    }

    componentDidUpdate() {
        const topBarHeight = this._topBar.current ? this._topBar.current.offsetHeight : 0;
        const settingsYOffset = topBarHeight + 10;

        if (this.state.settingsYOffset !== settingsYOffset) {
            this.setState({ settingsYOffset: settingsYOffset });
        }
    }

    componentWillUnmount() {
        window.clearInterval(this._timerID);
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
                <TweetView tweets={tweets} settingsYOffset={this.state.settingsYOffset} />
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
