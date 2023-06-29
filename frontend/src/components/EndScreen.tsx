import React from "react";
import { CopyButton } from "./CopyButton";
import { ExperimentalCondition, ContinuationCodeForCondition } from "../common/ExperimentalCondition";

import "./EndScreen.css";

export function EndScreen(props: {condition: ExperimentalCondition}) {
    const [isHelpOpen, setIsHelpOpen] = React.useState(false);
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = detectIOS(userAgent);
    const isAndroid = userAgent.includes("android");
    const isMobile = isIOS || isAndroid;
    const code = ContinuationCodeForCondition[props.condition];

    return <div className="EndScreen EndScreen-fade-in vertical-center">
        <div className="container">
            <h1>Thanks for browsing!</h1>
            <p className="EndScreen-instructions">
                Use this code to continue inside Qualtrics:
                <code>{code}</code>
                <CopyButton copyString={code} />
            </p>
            <p className="EndScreen-instructions">
                You may now close the current tab and return to Qualtrics.
                {isMobile && !isHelpOpen && <button className="btn btn-link" onClick={() => setIsHelpOpen(true)}>
                    How do I manage tabs?
                </button>}
            </p>

            <div style={{ marginTop: "2em", visibility: isHelpOpen ? "visible" : "hidden" }}>
                {isIOS && <p>
                    To manage tabs, tap Switch Tabs on the right side of the address bar. It probably looks like a
                    square overlapping another square.  (You may also have to tap the address bar first to open up the
                    controls.)
                </p>}
                {isAndroid && <p>
                    To manage tabs, tap Switch Tabs on the right side of the address bar.  It probably looks like
                    a square with a number inside it.
                </p>}
            </div>
        </div>
    </div>;
}

function detectIOS(userAgent: string) {
    if (userAgent.includes("iphone")) {
        return true;
    }
    return (userAgent.match(/(ipad)/) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
}
