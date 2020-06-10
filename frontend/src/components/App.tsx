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

const IS_USING_STATIC_TWEETS = true;
const BANNER_SHOW_TIMEOUT_SECONDS = 5;
const EXPERIMENT_STOP_TIMEOUT_SECONDS = 10;

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
    bannerCountDown: number;
    terminateExperiment: boolean;
}


export class App extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            tweetFetchStatus: TweetFetchStatus.NOT_LOGGED_IN,
            tweets: [],
            fetchErrorReason: "",
            bannerCountDown: -1,
            terminateExperiment: false,
        };
    }

    componentDidMount() {
        if (IS_USING_STATIC_TWEETS) {
            setTimeout(() => {
                this.loadStaticTweets();
            }, 3000);
        } else {
            // Use the URL query string to check if we can immediately fetch the user's tweets.
            // substring(1) cuts off the "?" in the URL query string
            const queryParams = querystring.parse(window.location.search.substring(1));
            if (GetTweetsApi.checkQueryParams(queryParams)) {
                this.fetchTweets({
                    oauth_token: queryParams.oauth_token,
                    oauth_verifier: queryParams.oauth_verifier
                }).catch(console.error);
            }
        }
    }

    startTimer = () => {
        setTimeout(() => {
            this.setState({
                bannerCountDown: EXPERIMENT_STOP_TIMEOUT_SECONDS,
            }, () => {
                const intervalId = setInterval(() => {
                    const newCountDown = this.state.bannerCountDown - 1;
                    this.setState({
                        bannerCountDown: newCountDown,
                    });
                    if (newCountDown <= 0) {
                        clearInterval(intervalId);
                        this.setState({
                            terminateExperiment: true,
                        });
                    }

                }, 1000);
            });
        }, BANNER_SHOW_TIMEOUT_SECONDS * 1000);
    }

    fetchTweets = async (params: GetTweetsApi.RequestQueryParams): Promise<void> => {
        try {
            const response = await axios.request<GetTweetsApi.ResponsePayload>({
                method: GetTweetsApi.METHOD,
                baseURL: GetTweetsApi.PATH,
                params: params
            });
            this.setState({
                tweets: response.data.tweets,
                tweetFetchStatus: TweetFetchStatus.DONE
            }, () => {
                this.startTimer();
            });
        } catch (error) {
            this.setState({
                tweetFetchStatus: TweetFetchStatus.FETCH_ERROR,
                fetchErrorReason: new ApiErrorHandler().getTwitterApiErrorReason(error)
            });
        }
    }

    handleLoginError = (error: any) => {
        this.setState({
            tweetFetchStatus: TweetFetchStatus.LOGIN_ERROR,
            fetchErrorReason: new ApiErrorHandler().getTwitterApiErrorReason(error)
        });
    }

    loadStaticTweets() {
        this.setState({
            tweets: sampleTweets as unknown as Status[],
            tweetFetchStatus: TweetFetchStatus.DONE
        }, () => {
            this.startTimer();
        });
    }

    render() {
        let pane;
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
                    onError={this.handleLoginError}
                    mainErrorMessage={errorMessage}
                    errorReason={this.state.fetchErrorReason}
                />;
                break;
        }

        const bannerClass = (this.state.bannerCountDown > 0 ? 'animated-show' : 'animated-close') + ' alert alert-danger';
        const overlayClass = (this.state.terminateExperiment ? 'animated-show' : 'animated-close') + ' termination-overlay';


        return <div>
            <div className={'sticky-top'}>
                <nav className="navbar">
                    <span className="navbar-brand">Custom Twitter Viewer</span>
                </nav>
                <div className={bannerClass}>
                    <h6>!!! Current experiment will end in <em>{this.state.bannerCountDown}</em> seconds</h6>
                </div>
            </div>
            {pane}
            <div className={overlayClass}>
                <div>
                    <h1>Time's up!</h1>
                    <p>Experiment is over. Please wait for further instructions!</p>
                </div>
            </div>
        </div>;
    }
}