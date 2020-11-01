import { AugmentedTweet } from "../../AugmentedTweet";

export interface ITweetFilterDataConfig {
    shouldFlip: boolean;
    shouldAnimate: boolean;
}

export interface ITweetFilter {
    originalData: AugmentedTweet[];
    onDataUpdated(tweets: AugmentedTweet[], config?: ITweetFilterDataConfig): void;
}
