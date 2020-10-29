import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import * as RequestTokenApi from "../common/requestTokenApi";
import * as GetTweetsApi from "../common/getTweetsApi";

const TWITTER_AUTH_URL = "https://api.twitter.com/oauth/authenticate";

interface Props {
    /** Callback for errors that happen when trying to get a request token from the backend. */
    onError?: (error: unknown) => void;
}

interface State {
    /** Whether we are currently trying to get the request token from the backend. */
    isLoading: boolean
}

/**
 * Button for users to authorize our app with Twitter.  Upon clicking, the user should be redirected to Twitter's
 * external authorization page.  They will then be redirected to our page after they are done.  Query parameters of the
 * current location should be preserved when users return to our page.
 * 
 * @author Silas Hsu
 */
export class TwitterLoginButton extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: false
        };
        this.redirectToTwitterLogin = this.redirectToTwitterLogin.bind(this);
    }

    /**
     * Gets request token from the backend and then redirects the user to Twitter's authorization page.
     */
    async redirectToTwitterLogin() {
        this.setState({isLoading: true});
        const params = new URLSearchParams(window.location.search);
        deleteGetTweetApiParams(params);
        try {
            const response = await axios.request<RequestTokenApi.ResponsePayload>({
                method: RequestTokenApi.METHOD,
                url: RequestTokenApi.PATH,
                params: params // Query parameters to preserve upon redirecting back to us
            });
            window.location.href = TWITTER_AUTH_URL + "?oauth_token=" + response.data.oauth_token;
        } catch (error) {
            this.setState({isLoading: false});
            this.props.onError && this.props.onError(error);
        }
    }

    render() {
        return <button
            className="btn btn-light"
            style={{border: "1px solid lightgrey"}}
            onClick={this.redirectToTwitterLogin}
            disabled={this.state.isLoading}
        >
            <FontAwesomeIcon icon={faTwitter} color="#00aced" size="lg" style={{marginRight: "5px"}} />
            {this.state.isLoading ? "Working..." : "Log in with Twitter"}
        </button>;
    }
}

/**
 * Deletes parameters related to the Tweet fetch API, as Twitter will give them to us when redirecting back, and we
 * don't want to be potentially confused by multiple copies of the same parameter.
 * 
 * @param params parameters to mutate
 */
function deleteGetTweetApiParams(params: URLSearchParams) {
    del("oauth_token");
    del("oauth_verifier");
    function del(key: keyof GetTweetsApi.RequestQueryParams) {
        params.delete(key);
    }
}
