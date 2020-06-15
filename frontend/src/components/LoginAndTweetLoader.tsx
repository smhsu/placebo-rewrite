import React from "react";
import axios from "axios";
import querystring from "querystring";
import { Status } from "twitter-d";

import { LoginPane } from "./LoginPane";
import * as GetTweetsApi from "../common/getTweetsApi";
import { ApiErrorHandler } from "../ApiErrorHandler";

import spinner from "../loading-small.gif";

enum TweetFetchStatus {
    NOT_LOGGED_IN,
    LOADING,
    LOGIN_ERROR,
    FETCH_ERROR,
    DONE
}

interface Props {
    onTweetsFetched: (tweets: Status[]) => void;
}

interface State {
    tweetFetchStatus: TweetFetchStatus;
    fetchErrorReason: string;
}

export class LoginAndTweetLoader extends React.Component<Props, State> {
    static defaultProps = {
        onNewTweets: () => undefined
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            tweetFetchStatus: TweetFetchStatus.NOT_LOGGED_IN,
            fetchErrorReason: ""
        };

        this.handleTweets = this.handleTweets.bind(this);
        this.fetchTweets = this.fetchTweets.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    componentDidMount() {
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

    async fetchTweets(params: GetTweetsApi.RequestQueryParams): Promise<void> {
        this.setState({ tweetFetchStatus: TweetFetchStatus.LOADING });
        try {
            const response = await axios.request<GetTweetsApi.ResponsePayload>({
                method: GetTweetsApi.METHOD,
                baseURL: GetTweetsApi.PATH,
                params: params
            });
            this.handleTweets(response.data.tweets);
        } catch (error) {
            this.handleError(error, TweetFetchStatus.FETCH_ERROR);
        }
    }

    handleTweets(tweets: Status[]) {
        this.setState({ tweetFetchStatus: TweetFetchStatus.DONE });
        this.props.onTweetsFetched(tweets);
    }

    handleError(error: any, nextFetchStatus: TweetFetchStatus) {
        this.setState({
            tweetFetchStatus: nextFetchStatus,
            fetchErrorReason: new ApiErrorHandler().getTwitterApiErrorReason(error)
        });
    }

    render() {
        switch (this.state.tweetFetchStatus) {
            case TweetFetchStatus.DONE:
                return <div className="vertical-and-horiz-center">
                    Done.
                </div>;
            case TweetFetchStatus.LOADING:
                return <div className="vertical-and-horiz-center">
                    <div>Loading your Tweets... <img src={spinner} alt="Loading" /></div>
                </div>;
            case TweetFetchStatus.LOGIN_ERROR:
            case TweetFetchStatus.FETCH_ERROR:
            case TweetFetchStatus.NOT_LOGGED_IN:
            default:
                let errorMessage = "";
                if (this.state.tweetFetchStatus === TweetFetchStatus.LOGIN_ERROR) {
                    errorMessage = "Login request failed.";
                } else if (this.state.tweetFetchStatus === TweetFetchStatus.FETCH_ERROR) {
                    errorMessage = "Couldn't fetch your tweets.";
                }

                return <LoginPane
                    onError={error => this.handleError(error, TweetFetchStatus.LOGIN_ERROR)}
                    mainErrorMessage={errorMessage}
                    errorReason={this.state.fetchErrorReason}
                />;
        }
    }
}
