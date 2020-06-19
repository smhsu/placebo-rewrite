import { Status } from "twitter-d";
import { ReactElement } from "react";

export interface ITweetFilter<S> {
    getInitialState(): S;

    renderSetting(currentState: S, updateState: (newState: S) => void): ReactElement

    filter(tweets: Readonly<Status[]>, currentState: S): Status[];
}
