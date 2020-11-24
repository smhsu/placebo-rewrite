import { ITweetFilter } from "./ITweetFilter";
import { OriginalOrderSorter } from "../../tweetModels/ThreadSorter";

const THREAD_SORTER = new OriginalOrderSorter();

export const noopFilter: ITweetFilter<undefined> = {
    initialState: undefined,
    SettingComponent: null,
    doFilter: THREAD_SORTER.sort,
    shouldAnimateChanges: false
}
