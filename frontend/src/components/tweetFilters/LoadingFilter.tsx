import React from "react";
import { ITweetFilter } from "./ITweetFilter";
import { AugmentedTweet } from "../../AugmentedTweet";

import spinner from "../../loading-small.gif";

export class LoadingFilter implements ITweetFilter<undefined> {
    getInitialState() {
        return undefined;
    }

    renderSetting() {
        return <div><img src={spinner} alt="Loading" /></div>;
    }

    filter(tweets: AugmentedTweet[]) {
        return tweets;
    }
}
