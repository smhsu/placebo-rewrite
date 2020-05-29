import React from "react";
import axios from "axios";
import querystring from "querystring";
import { Status } from "twitter-d";

import { LoginPane } from "./LoginPane";
import { TweetView } from "./TweetView";
import * as GetTweetsApi from "../common/getTweetsApi";
import { ApiErrorHandler } from "../ApiErrorHandler";

import spinner from "../loading-small.gif";
import "./App.css";

enum TweetFetchStatus {
    NOT_LOGGED_IN,
    LOADING,
    LOGIN_ERROR,
    FETCH_ERROR,
    DONE
}

interface State {
    tweetFetchStatus: TweetFetchStatus;
    tweets: Status[];
    fetchErrorReason: string;
}

export class App extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        let tweetFetchStatus = TweetFetchStatus.DONE; // TEMP

        // Use the URL query string to check if we can immediately fetch the user's tweets.
        // substring(1) cuts off the "?" in the URL query string
        const queryParams = querystring.parse(window.location.search.substring(1));
        if (GetTweetsApi.checkQueryParams(queryParams)) {
            tweetFetchStatus = TweetFetchStatus.LOADING;
            this.fetchTweets({
                oauth_token: queryParams.oauth_token,
                oauth_verifier: queryParams.oauth_verifier
            });
        }

        this.state = {
            tweetFetchStatus,
            tweets: [],
            fetchErrorReason: ""
        };
        this.fetchTweets = this.fetchTweets.bind(this);
        this.handleLoginError = this.handleLoginError.bind(this);
    }

    async fetchTweets(params: GetTweetsApi.RequestQueryParams): Promise<void> {
        try {
            const response = await axios.request<GetTweetsApi.ResponsePayload>({
                method: GetTweetsApi.METHOD,
                baseURL: GetTweetsApi.PATH,
                params: params
            });
            this.setState({
                tweets: response.data.tweets,
                tweetFetchStatus: TweetFetchStatus.DONE
            });
        } catch (error) {
            this.setState({
                tweetFetchStatus: TweetFetchStatus.FETCH_ERROR,
                fetchErrorReason: new ApiErrorHandler().getTwitterApiErrorReason(error)
            });
        }
    }

    handleLoginError(error: any) {
        this.setState({
            tweetFetchStatus: TweetFetchStatus.LOGIN_ERROR,
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
                pane = <TweetView />;
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
                    onError={this.handleLoginError}
                    mainErrorMessage={errorMessage}
                    errorReason={this.state.fetchErrorReason}
                />;
                break;
        }

        return <div>
            <nav className="navbar sticky-top">
                <span className="navbar-brand">Custom Twitter Feed Viewer</span>
            </nav>
            {pane}
        </div>;
    }
}
