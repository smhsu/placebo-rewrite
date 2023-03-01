import React from "react";
import { ErrorInfo } from "./AppState";
import { CopyButton } from "./CopyButton";
import { getUrlWithStaticTweets } from "../staticTweetsSwitch";

interface Props {
    errorInfo?: ErrorInfo
    buttonElement: React.ReactNode;
}

export function InstructionsAndButton(props: Props): JSX.Element {
    const {errorInfo, buttonElement} = props;

    let instructions;
    if (errorInfo) {
        instructions = <div className="alert alert-danger" role="alert">
            <h4>Error</h4>
            <div>{errorInfo.failedAction}</div>
            <p><i>{errorInfo.cause || "unknown."}</i></p>
            <p>
                Click the below button to try again, or if the problem persists, enter the following code to continue in
                Qualtrics:
            </p>
            <div style={{ display: "flex", gap: "1em", alignItems: "center" }}>
                <code>{process.env.REACT_APP_ERROR_CONTINUE_CODE || ""}</code>
                <CopyButton copyString={process.env.REACT_APP_ERROR_CONTINUE_CODE || ""} />
            </div>
        </div>
    } else {
        instructions = <p style={{fontSize: "x-large"}}>
            <b>Welcome!</b> Please click the below button to get started.
        </p>;
    }

    return <div className="container vertical-center">
        {instructions}
        <div>{buttonElement}</div>
        <div style={{ marginTop: "3em", fontSize: "smaller", fontStyle: "italic" }}>
            If you've changed your mind about using your Twitter account, you may use
            an <a href={getUrlWithStaticTweets()}>alternative app that doesn't require login</a>.
        </div>
    </div>;
}
