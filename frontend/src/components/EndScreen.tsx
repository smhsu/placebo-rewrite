import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

import "./EndScreen.css";

export function EndScreen() {
    const [isCopied, setIsCopied] = React.useState(false);
    const handleCopyPressed = React.useCallback(() => {
        navigator.clipboard.writeText(process.env.REACT_APP_CONTINUE_CODE || "")
            .then(() => setIsCopied(true));
    }, []);

    return <div className="EndScreen EndScreen-fade-in vertical-center">
        <div className="container">
            <h1>Thanks for browsing!</h1>
            <p className="EndScreen-instructions">
                Use this code to continue inside Qualtrics:
                <code>{process.env.REACT_APP_CONTINUE_CODE}</code>
                <button className="btn btn-light EndScreen-copy-button" onClick={handleCopyPressed}>
                    {isCopied ?
                        <span className="EndScreen-copy-success"><FontAwesomeIcon icon={faCheck} /> Copied!</span>
                        :
                        "Copy"
                    }
                </button>
            </p>
            <button className="btn btn-link" onClick={() => window.close()}>
                <FontAwesomeIcon icon={faTimes} /> Close this tab and return to Qualtrics
            </button>
        </div>
    </div>;
}
