import { Status } from "twitter-d";
import { chunk, sortBy } from "lodash";
import { RandomNumberGenerator } from "./RandomNumberGenerator";

export interface ITweetPopularityCalculator {
    partitionByPopularity<T extends Status>(tweets: T[], numChunks: number): T[][];
}

export class TweetPopularityCalculator implements ITweetPopularityCalculator {
    getPopularity(tweet: Status): number {
        return tweet.retweeted_status ? tweet.retweeted_status.favorite_count : tweet.favorite_count;
    }

    partitionByPopularity<T extends Status>(tweets: T[], numChunks: number): T[][] {
        return partitionUsingValue(tweets, numChunks, this.getPopularity);
    }
}

export class RandomPopularityCalculator implements ITweetPopularityCalculator {
    constructor(private _seed="0") {}

    partitionByPopularity<T extends Status>(tweets: T[], numChunks: number): T[][] {
        const rng = new RandomNumberGenerator(this._seed);
        return partitionUsingValue(tweets, numChunks, () => rng.nextFloat());
    }
}

function partitionUsingValue<T>(items: T[], numChunks: number, iterate: (item: T) => number): T[][] {
    const sorted = sortBy(items, iterate);
    const chunkSize = Math.ceil(items.length / numChunks);
    return chunk(sorted, chunkSize);
}
