import React from "react";
import { CopyButton } from "./CopyButton";

import "./EndScreen.css";

export function EndScreen() {
    return <div className="EndScreen EndScreen-fade-in vertical-center">
        <div className="container">
            <h1>Thanks for browsing!</h1>
            <p className="EndScreen-instructions">
                Use this code to continue inside Qualtrics:
                <code>{process.env.REACT_APP_CONTINUE_CODE || ""}</code>
                <CopyButton copyString={process.env.REACT_APP_CONTINUE_CODE || ""} />
            </p>
            <button className="btn btn-link" onClick={() => window.history.back()}>
                {"<"} Back to Qualtrics
            </button>
        </div>
    </div>;
}
