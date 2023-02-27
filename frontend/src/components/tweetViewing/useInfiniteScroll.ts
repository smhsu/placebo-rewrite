import React from "react";
import { throttle } from "lodash";

const NUM_PER_CHUNK = 20;
const REMAINING_SCREEN_HEIGHTS_TO_LOAD_CHUNK = 3;
const CHECK_INTERVAL_MS = 250;

export function useInfiniteScroll() {
    const [feedSize, setFeedSize] = React.useState(NUM_PER_CHUNK);
    const checkDisplayMoreThreads = React.useMemo(() => throttle(() => {
        const numPxUntilBottom = document.body.clientHeight - (window.scrollY + window.screen.height);
        if (numPxUntilBottom < window.screen.height * REMAINING_SCREEN_HEIGHTS_TO_LOAD_CHUNK) {
            setFeedSize(oldValue => oldValue + NUM_PER_CHUNK);
        }
    }, CHECK_INTERVAL_MS), []);

    React.useEffect(() => {
        window.addEventListener("scroll", checkDisplayMoreThreads);
        return function removeListener() {
            window.removeEventListener("scroll", checkDisplayMoreThreads);
            checkDisplayMoreThreads.cancel();
        }
    }, [checkDisplayMoreThreads]);

    const resetFeedSize = React.useCallback(() => {
        setFeedSize(NUM_PER_CHUNK);
    }, []);

    return {
        feedSize,
        resetFeedSize
    };
}
