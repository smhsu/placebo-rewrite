import { Status } from "twitter-d";
import { chunk, sortBy } from "lodash";

export class TweetPopularityCalculator {
    getPopularity(tweet: Status): number {
        return tweet.retweeted_status ? tweet.retweeted_status.favorite_count : tweet.favorite_count;
    }

    partitionByPopularity<T extends Status>(tweets: T[], numChunks: number): T[][] {
        const sorted = sortBy(tweets, this.getPopularity);
        const chunkSize = Math.ceil(tweets.length / numChunks);
        return chunk(sorted, chunkSize);
    }
}

export class RandomPopularityCalculator extends TweetPopularityCalculator {
    /**
     * @override
     */
    getPopularity(_tweet: Status): number {
        return Math.random();
    }
}
