import { chunk, sortBy } from "lodash";
import { Tweet } from "./Tweet";

export class TweetPopularityCalculator {
    getPopularity(tweet: Tweet): number {
        return tweet.retweet ? tweet.retweet.favorite_count : tweet.favorite_count;
    }

    partitionByPopularity<T extends Tweet>(tweets: T[], numChunks: number): T[][] {
        const sorted = sortBy(tweets, this.getPopularity);
        const chunkSize = Math.ceil(tweets.length / numChunks);
        return chunk(sorted, chunkSize);
    }
}

export class RandomPopularityCalculator extends TweetPopularityCalculator {
    /**
     * @override
     */
    getPopularity(_tweet: Tweet): number {
        return Math.random();
    }
}
