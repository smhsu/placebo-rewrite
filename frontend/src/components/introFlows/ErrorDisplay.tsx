import React from "react";
import { ErrorInfo } from "../AppState";
import { CopyButton } from "../CopyButton";

interface ErrorDisplayProps {
    errorInfo: ErrorInfo
}

export function ErrorDisplay(props: ErrorDisplayProps) {
    const errorInfo = props.errorInfo;
    return <div className="alert alert-danger" role="alert">
        <p style={{fontSize: "x-large"}}>Error</p>
        <div>{errorInfo.failedAction}</div>
        <p><i>{errorInfo.cause || "unknown."}</i></p>
        <p>
            Click below to retry, or if the problem persists, enter the following code to continue in Qualtrics:
        </p>
        <div style={{ display: "flex", gap: "1em", alignItems: "center" }}>
            <code>{process.env.REACT_APP_ERROR_CONTINUE_CODE || ""}</code>
            <CopyButton copyString={process.env.REACT_APP_ERROR_CONTINUE_CODE || ""} />
        </div>
    </div>
}
