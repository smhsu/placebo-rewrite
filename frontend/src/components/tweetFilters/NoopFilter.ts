import { ITweetFilter } from "./ITweetFilter";
import { sortThreadsByOriginalOrder } from "../../TweetThread";

export const noopFilter: ITweetFilter<undefined> = {
    initialState: undefined,
    SettingComponent: null,
    doFilter: sortThreadsByOriginalOrder,
    shouldAnimateChanges: false
}
