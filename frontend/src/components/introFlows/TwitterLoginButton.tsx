import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { generateTwitterAuthUrl } from "./OAuth2Utils";

interface TwitterLoginButtonProps {
    className?: string;
}

export function TwitterLoginButton(props: TwitterLoginButtonProps) {
    const { className } = props;
    const [isLoading, setIsLoading] = React.useState(false);

    const handleClick = () => {
        setIsLoading(true);
        generateTwitterAuthUrl().then(url => window.location.href = url);
    }

    return <button
        className={(className || "") + " btn btn-light"}
        style={{border: "1px solid lightgrey"}}
        onClick={handleClick}
        disabled={isLoading}
    >
        <FontAwesomeIcon icon={faTwitter} color="#00aced" size="lg" style={{marginRight: "5px"}} />
        {isLoading ? "Loading..." : "Log in with Twitter"}
    </button>;
}
