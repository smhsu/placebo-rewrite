import React from "react";
import { ITweetFilter, SettingComponentProps } from "./ITweetFilter";
import { TweetThread } from "../../tweetModels/TweetThread";
import { OriginalOrderSorter } from "../../tweetModels/ThreadSorter";

const THREAD_SORTER = new OriginalOrderSorter();

export const swapFilter: ITweetFilter<boolean> = {
    /** Whether we are swapping the first two threads. */
    initialState: false,

    SettingComponent({currentState, onStateUpdated}: SettingComponentProps<boolean>) {
        const handleClick = () => {
            window.scrollTo({top: 0, behavior: "smooth"});
            onStateUpdated(!currentState);
        };
        return <button className="btn btn-primary" onClick={handleClick}>Swap first two threads</button>;
    },

    doFilter(threads: TweetThread[], isSwapping: boolean): TweetThread[] {
        const sortedThreads = THREAD_SORTER.sort(threads);
        return isSwapping ? swapFirstTwo(sortedThreads) : sortedThreads;
    },

    shouldAnimateChanges: true,
};

function swapFirstTwo<S>(data: S[]) {
    if (data.length <= 1) {
        return data;
    }
    const firstElement = data[0];
    data[0] = data[1];
    data[1] = firstElement;
    return data;
}
