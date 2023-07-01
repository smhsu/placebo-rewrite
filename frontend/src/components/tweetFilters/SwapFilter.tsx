import React from "react";
import { SettingsLayout } from "./SettingsLayout";
import { ITweetFilter, SettingComponentProps } from "./ITweetFilter";
import { TweetThread } from "../../tweetModels/TweetThread";
import { OriginalOrderSorter } from "../../tweetModels/ThreadSorter";


const THREAD_SORTER = new OriginalOrderSorter();

export const swapFilter: ITweetFilter<boolean> = {
    /** Whether we are swapping the first two threads. */
    initialState: false,

    SettingComponent({currentState, onStateUpdated, onClick}: SettingComponentProps<boolean>) {
        const handleClick = () => {
            window.scrollTo({top: 0, behavior: "smooth"});
            onStateUpdated(!currentState);
            onClick();
        };
        return <SettingsLayout>
            <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={handleClick}>
                Swap first two threads
            </button>
        </SettingsLayout>;
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
