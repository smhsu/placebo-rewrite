import React from "react";
import { ITweetFilter } from "./ITweetFilter";
import { Status } from "twitter-d";

import spinner from "../../loading-small.gif";

export class LoadingFilter implements ITweetFilter<undefined> {
    getInitialState() {
        return undefined;
    }

    renderSetting() {
        return <div><img src={spinner} alt="Loading" /></div>;
    }

    filter(tweets: Status[]) {
        return tweets;
    }
}
