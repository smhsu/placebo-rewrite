import { ITweetFilter } from "./ITweetFilter";
import memoizeOne from "memoize-one";
import { shuffle, chunk } from "lodash";
import { stratifiedPopularityFilter, NUM_SLIDER_STOPS } from "./StratifiedPopularityFilter";
import { TweetThread } from "../../TweetThread";

export const notWorkingPopularityFilter: ITweetFilter<number> = {
    initialState: stratifiedPopularityFilter.initialState,

    SettingComponent: stratifiedPopularityFilter.SettingComponent,

    doFilter(threads: TweetThread[], currentState: number) {
        const shuffledThreads = shuffleThreadsMemoized(threads);
        const partitions = chunk(shuffledThreads, Math.ceil(threads.length / NUM_SLIDER_STOPS));
        // currentState - 1 because the slider starts at 1, but the partition indexing starts at 0.
        return partitions[currentState - 1];
    },

    shouldAnimateChanges: stratifiedPopularityFilter.shouldAnimateChanges
};

const shuffleThreadsMemoized = memoizeOne(function(threads: TweetThread[]) {
    return shuffle(threads);
});
