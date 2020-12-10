import { ITweetFilter } from "./ITweetFilter";
import { IThreadSorter } from "../../tweetModels/ThreadSorter";
import { TweetThread } from "../../tweetModels/TweetThread";

export class NoSettingFilter implements ITweetFilter<undefined> {
    initialState = undefined;
    SettingComponent = null;
    shouldAnimateChanges = false;

    constructor(private _threadSorter: IThreadSorter) {}

    doFilter(tweets: TweetThread[]): TweetThread[] {
        return this._threadSorter.sort(tweets);
    }
}
