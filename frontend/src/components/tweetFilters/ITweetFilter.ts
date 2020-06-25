import React from "react";
import { TimeParsedTweet } from "../../TimeParsedTweet";

export interface ITweetFilter<S> {
    getInitialState(): S;

    renderSetting(currentState: S, updateState: (newState: S) => void): React.ReactElement

    filter(tweets: TimeParsedTweet[], currentState: S): TimeParsedTweet[];

    isDisallowSortingByTime?: boolean;
}
