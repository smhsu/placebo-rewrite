import React from "react";
import { AugmentedTweet } from "../../AugmentedTweet";

export interface ITweetFilter<S> {
    getInitialState(): S;

    renderSetting(currentState: S, updateState: (newState: S) => void): React.ReactNode;

    filter(tweets: AugmentedTweet[], currentState: S): AugmentedTweet[];

    isDisallowSortingByTime?: boolean;
}
