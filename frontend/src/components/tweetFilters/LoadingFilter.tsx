import React from "react";
import { ITweetFilter } from "./ITweetFilter";
import { TimeParsedTweet } from "../../TimeParsedTweet";

import spinner from "../../loading-small.gif";

export class LoadingFilter implements ITweetFilter<undefined> {
    getInitialState() {
        return undefined;
    }

    renderSetting() {
        return <div><img src={spinner} alt="Loading" /></div>;
    }

    filter(tweets: TimeParsedTweet[]) {
        return tweets;
    }
}
