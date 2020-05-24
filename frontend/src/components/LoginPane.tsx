import React from "react";
import { TwitterLoginButton } from "./TwitterLoginButton";

interface Props {
    /** Error message to display. */
    mainErrorMessage?: string;

    /** Additional details for the error. */
    errorReason?: string;

    /** Callback for errors that happen when trying to get a request token from the backend. */
    onError: (error: any) => void;
}

/**
 * Displays Twitter login button and errors related to login.
 * 
 * @param props
 * @return component to render
 * @author Silas Hsu
 */
export function LoginPane(props: Props): JSX.Element {
    let instructions = null;

    if (props.mainErrorMessage) {
        instructions = <div className="alert alert-danger" role="alert">
            <div>{props.mainErrorMessage}</div>
            <p><i>Reason:</i> {props.errorReason || "unknown."}</p>
            <p>Click the login button to try again, or if the problem persists, take a screenshot and contact us.</p>
        </div>
    } else {
        instructions = <p style={{fontSize: "x-large"}}>
            <b>Welcome!</b> Please click the below button to get started.
        </p>;
    }

    return <div className="container vertical-center">
        {instructions}
        <div><TwitterLoginButton onError={props.onError} /></div>
    </div>;
}
