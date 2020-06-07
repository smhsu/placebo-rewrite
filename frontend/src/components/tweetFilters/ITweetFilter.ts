import { Status } from "twitter-d";
import { ReactElement } from "react";

export interface ITweetFilter<S> {
    getInitialState(tweets: Status[]): S;

    renderSetting(tweets: Status[], currentState: S, updateState: (newState: S) => void): ReactElement

    filter(tweets: Status[], currentState: S): Status[];
}
