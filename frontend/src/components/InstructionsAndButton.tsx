import React from "react";
import { ErrorInfo } from "./AppState";

interface Props {
    errorInfo?: ErrorInfo
    buttonElement: React.ReactNode;
}

export function InstructionsAndButton(props: Props): JSX.Element {
    const {errorInfo, buttonElement} = props;

    let instructions = null;
    if (errorInfo) {
        instructions = <div className="alert alert-danger" role="alert">
            <h4>Error</h4>
            <div>{errorInfo.failedAction}</div>
            <p><i>{errorInfo.cause || "unknown."}</i></p>
            <p>
                Click the below button to try again, or if the problem persists, enter the following code to continue in
                Qualtrics:
            </p>
            <code>TBD</code>
        </div>
    } else {
        instructions = <p style={{fontSize: "x-large"}}>
            <b>Welcome!</b> Please click the below button to get started.
        </p>;
    }

    return <div className="container vertical-center">
        {instructions}
        <div>{buttonElement}</div>
    </div>;
}
