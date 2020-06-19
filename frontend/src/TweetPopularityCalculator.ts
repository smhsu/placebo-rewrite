import { Status } from "twitter-d";
import { chunk, sortBy } from "lodash";

export class TweetPopularityCalculator {
    getPopularity(tweet: Status): number {
        return tweet.retweeted_status ? tweet.retweeted_status.favorite_count : tweet.favorite_count;
    }

    sortAndChunk(tweets: Status[], numChunks: number): Status[][] {
        const sorted = sortBy(tweets, this.getPopularity);
        const chunkSize = Math.ceil(tweets.length / numChunks);
        return chunk(sorted, chunkSize);
    }
}
