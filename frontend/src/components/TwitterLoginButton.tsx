import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import * as RequestTokenApi from "../common/requestTokenApi";

const TWITTER_AUTH_URL = "https://api.twitter.com/oauth/authenticate";

interface Props {
    /** Callback for errors that happen when trying to get a request token from the backend. */
    onError: (error: unknown) => void;
}

export function TwitterLoginButton(props: Props) {
    const [isWorking, setIsWorking] = React.useState(false);

    const handleClick = async () => {
        setIsWorking(true);
        try {
            const oauthTokenResponse = await axios.request<RequestTokenApi.ResponsePayload>({
                method: RequestTokenApi.METHOD,
                url: RequestTokenApi.PATH,
            });
            const oauthToken = oauthTokenResponse.data.oauth_token;
            window.location.href = `${TWITTER_AUTH_URL}?oauth_token=${oauthToken}`;
        } catch (error) {
            props.onError(error);
        }
        setIsWorking(false);
    }

    return <div style={{display: "flex", alignItems: "center"}}>
        <button
            className="btn btn-light"
            style={{border: "1px solid lightgrey"}}
            onClick={handleClick}
            disabled={isWorking}
        >
            <FontAwesomeIcon icon={faTwitter} color="#00aced" size="lg" style={{marginRight: "5px"}} />
            {isWorking ? "Working..." : "Log in with Twitter"}
        </button>
    </div>;
}
