import React from "react";
import { ITweetFilter, SettingComponentProps } from "./ITweetFilter";
import { TweetThread, organizeIntoThreads } from "../../TweetThread";
import { AugmentedTweet } from "../../AugmentedTweet";

function swapFirstTwo<S>(data: S[]) {
    if (data.length <= 1) {
        return data;
    }
    const firstElement = data[0];
    data[0] = data[1];
    data[1] = firstElement;
    return data;
}

export const swapFilter: ITweetFilter<boolean> = {
    initialState: false,

    SettingComponent({currentState, onStateUpdated}: SettingComponentProps<boolean>) {
        return <button
            className="btn btn-primary"
            onClick={() => onStateUpdated(!currentState)}
        >
            Swap first two threads
        </button>;
    },

    doFilter(tweets: AugmentedTweet[], isSwapping: boolean): TweetThread[] {
        const threads = organizeIntoThreads(tweets);
        return isSwapping ? swapFirstTwo(threads) : threads;
    },

    shouldAnimateTweetChanges: true,
};
