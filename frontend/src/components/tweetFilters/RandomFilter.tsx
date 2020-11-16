import { shuffle } from "lodash";
import { ITweetFilter } from "./ITweetFilter";
import { AugmentedTweet } from "../../AugmentedTweet";
import { TweetThread, organizeIntoThreads } from "../../TweetThread";

export const randomFilter: ITweetFilter<undefined> = {
    initialState: undefined,
    SettingComponent: null,
    doFilter(tweets: AugmentedTweet[]): TweetThread[] {
        return shuffle(organizeIntoThreads(tweets));
    },
    shouldAnimateTweetChanges: false
}
