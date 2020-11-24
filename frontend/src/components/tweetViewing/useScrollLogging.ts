import React from "react";
import { ParticipantLog } from "../../ParticipantLog";

export function useScrollLogging(log: ParticipantLog) {
    const lastScrollY = React.useRef(window.scrollY);
    const lastClientHeight = React.useRef(document.body.clientHeight);
    React.useEffect(() => {
        function logScrollDistance() {
            if (document.body.clientHeight !== lastClientHeight.current) {
                // Skip scroll events caused by DOM changes
                lastScrollY.current = window.scrollY;
                lastClientHeight.current = document.body.clientHeight;
                return;
            }
            const pixelsScrolledDown = window.scrollY - lastScrollY.current;
            if (pixelsScrolledDown > 0) {
                log.pixelsScrolledDown += pixelsScrolledDown;
            } else {
                log.pixelsScrolledUp -= pixelsScrolledDown;
            }
            lastScrollY.current = window.scrollY;
        };

        window.addEventListener("scroll", logScrollDistance);
        return function removeListener() {
            window.removeEventListener("scroll", logScrollDistance);
        }
    }, [log]);
}
