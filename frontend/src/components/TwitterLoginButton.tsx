import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTwitter } from "@fortawesome/free-brands-svg-icons"
import * as RequestTokenApi from "../../../common/src/requestTokenApi";

const TWITTER_AUTH_URL = "https://api.twitter.com/oauth/authenticate";

interface Props {
    /** Callback for errors that happen when trying to get a request token from the backend. */
    onError: (error: any) => void;
}

interface State {
    /** Whether we are currently trying to get the request token from the backend. */
    isLoading: boolean
}

/**
 * Button for users to authorizie our app with Twitter.
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
        try {
            const response = await axios.post<RequestTokenApi.ResponsePayload>(RequestTokenApi.PATH, undefined);
            window.location.href = TWITTER_AUTH_URL + "?oauth_token=" + response.data.oauth_token;
        } catch (error) {
            this.setState({isLoading: false});
            this.props.onError(error);
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
