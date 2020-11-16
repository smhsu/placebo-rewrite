import { ITweetFilter } from "./ITweetFilter";
import { organizeIntoThreads } from "../../TweetThread";

export const noopFilter: ITweetFilter<undefined> = {
    initialState: undefined,
    SettingComponent: null,
    doFilter: tweets => organizeIntoThreads(tweets),
    shouldAnimateTweetChanges: false
}
