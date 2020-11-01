import React from "react";
import { ITweetFilter } from "./ITweetFilter";
import { AugmentedTweet } from "../../AugmentedTweet";

export class NoopFilter implements ITweetFilter<undefined> {
    getInitialState() {
        return undefined;
    }

    renderSetting(): React.ReactNode {
        return null;
    }

    filter(tweets: AugmentedTweet[]) {
        return tweets;
    }
}
