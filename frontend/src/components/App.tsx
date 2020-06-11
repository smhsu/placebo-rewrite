import React from "react";
import axios from "axios";
import querystring from "querystring";
import { Status } from "twitter-d";

import { LoginPane } from "./LoginPane";
import { TweetView } from "./TweetView";
import * as GetTweetsApi from "../common/getTweetsApi";
import { ApiErrorHandler } from "../ApiErrorHandler";

import sampleTweets from "../sampleTweets.json";
import spinner from "../loading-small.gif";
import "./App.css";

const IS_USING_STATIC_TWEETS = false;

enum TweetFetchStatus {
    NOT_LOGGED_IN,
    LOADING,
    LOGIN_ERROR,
    FETCH_ERROR,
    DONE
}

interface State {
    tweetFetchStatus: TweetFetchStatus;
    tweets: Readonly<Status>[];
    fetchErrorReason: string;
}

export class App extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            tweetFetchStatus: TweetFetchStatus.NOT_LOGGED_IN,
            tweets: [],
            fetchErrorReason: ""
        };
        this.setTweets = this.setTweets.bind(this);
        this.fetchTweets = this.fetchTweets.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    componentDidMount() {
        if (IS_USING_STATIC_TWEETS) {
            this.setTweets(sampleTweets);
        } else {
            // Use the URL query string to check if we can immediately fetch the user's tweets.
            // substring(1) cuts off the "?" in the URL query string
            const queryParams = querystring.parse(window.location.search.substring(1));
            if (GetTweetsApi.checkQueryParams(queryParams)) {
                this.fetchTweets({
                    oauth_token: queryParams.oauth_token,
                    oauth_verifier: queryParams.oauth_verifier
                });
            }
        }
    }

    async fetchTweets(params: GetTweetsApi.RequestQueryParams): Promise<void> {
        this.setState({ tweetFetchStatus: TweetFetchStatus.LOADING });
        try {
            const response = await axios.request<GetTweetsApi.ResponsePayload>({
                method: GetTweetsApi.METHOD,
                baseURL: GetTweetsApi.PATH,
                params: params
            });
            this.setTweets(response.data.tweets);
        } catch (error) {
            this.handleError(error, TweetFetchStatus.FETCH_ERROR);
        }
    }

    setTweets(tweets: Status[]) {
        this.setState({
            tweets,
            tweetFetchStatus: TweetFetchStatus.DONE
        });
    }

    handleError(error: any, nextFetchStatus: TweetFetchStatus) {
        this.setState({
            tweetFetchStatus: nextFetchStatus,
            fetchErrorReason: new ApiErrorHandler().getTwitterApiErrorReason(error)
        });
    }

    render() {
        let pane = null;
        switch (this.state.tweetFetchStatus) {
            case TweetFetchStatus.LOADING:
                pane = <div className="vertical-and-horiz-center">
                    <div>Loading your Tweets... <img src={spinner} alt="Loading" /></div>
                </div>;
                break;
            case TweetFetchStatus.DONE:
                pane = <TweetView tweets={this.state.tweets} />;
                break;
            case TweetFetchStatus.LOGIN_ERROR:
            case TweetFetchStatus.FETCH_ERROR:
            case TweetFetchStatus.NOT_LOGGED_IN:
            default: // Render login pane
                let errorMessage = "";
                if (this.state.tweetFetchStatus === TweetFetchStatus.LOGIN_ERROR) {
                    errorMessage = "Login request failed.";
                } else if (this.state.tweetFetchStatus === TweetFetchStatus.FETCH_ERROR) {
                    errorMessage = "Couldn't fetch your tweets.";
                }

                pane = <LoginPane
                    onError={error => this.handleError(error, TweetFetchStatus.LOGIN_ERROR)}
                    mainErrorMessage={errorMessage}
                    errorReason={this.state.fetchErrorReason}
                />;
                break;
        }

        return <div>
            <nav className="navbar sticky-top">
                <span className="navbar-brand">Custom Twitter Viewer</span>
            </nav>
            {pane}
        </div>;
    }
}
