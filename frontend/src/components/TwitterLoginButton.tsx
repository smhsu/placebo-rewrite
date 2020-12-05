import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { PermissionDeniedError, PopupBlockedError, TwitterAuthPopup } from "./TwitterAuthPopup";
import * as GetTweetsApi from "../common/getTweetsApi";

interface Props {
    onAuthToken: (token: GetTweetsApi.RequestQueryParams) => void;

    /** Callback for errors that happen when trying to get a request token from the backend. */
    onError: (error: unknown) => void;
}

enum ButtonState {
    NORMAL,
    WAITING,
    POPUP_BLOCKED
}
const TEXT_FOR_BUTTON_STATE: Record<ButtonState, string> = {
    [ButtonState.NORMAL]: "Log in with Twitter",
    [ButtonState.WAITING]: "Awaiting action inside popup...",
    [ButtonState.POPUP_BLOCKED]: "Login popup blocked"
}

export function TwitterLoginButton(props: Props) {
    const [buttonState, setButtonState] = React.useState(ButtonState.NORMAL);
    let iconColor = "";
    let buttonClassName = "btn ";
    if (buttonState === ButtonState.POPUP_BLOCKED) {
        iconColor = "white";
        buttonClassName += "btn-danger";
    } else {
        iconColor = "#00aced"
        buttonClassName += "btn-light";
    }

    const handleClick = async () => {
        setButtonState(ButtonState.WAITING);
        try {
            const token = await new TwitterAuthPopup().openAndWaitForAuthToken();
            setButtonState(ButtonState.NORMAL);
            props.onAuthToken(token);
        } catch (error) {
            if (error instanceof PopupBlockedError) {
                setButtonState(ButtonState.POPUP_BLOCKED);
            } else if (error instanceof PermissionDeniedError) {
                setButtonState(ButtonState.NORMAL);
            } else {
                setButtonState(ButtonState.NORMAL);
                props.onError(error);
            }
        }
    }

    return <div style={{display: "flex", alignItems: "center"}}>
        <button
            className={buttonClassName}
            style={{border: "1px solid lightgrey"}}
            onClick={handleClick}
            disabled={buttonState === ButtonState.WAITING}
        >
            <FontAwesomeIcon icon={faTwitter} color={iconColor} size="lg" style={{marginRight: "5px"}} />
            {TEXT_FOR_BUTTON_STATE[buttonState]}
        </button>
        {buttonState === ButtonState.POPUP_BLOCKED && <div style={{color: "red", marginLeft: "10px"}}>
            Disable your popup blocker and click the button to try again.
        </div>}
    </div>;
}
