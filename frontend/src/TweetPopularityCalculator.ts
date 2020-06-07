import { Status } from "twitter-d";
import { min, max } from "lodash";

export class TweetPopularityCalculator {
    getPopularity(tweet: Status): number {
        return Math.log1p(tweet.retweeted_status ? tweet.retweeted_status.favorite_count : tweet.favorite_count);
    }

    getPopularities(tweets: Status[]): number[] {
        return tweets.map(this.getPopularity);
    }

    getPopularityRange(tweets: Status[]): [number, number] {
        const popularities = this.getPopularities(tweets);
        return [
            min(popularities) || 0,
            max(popularities) || 0
        ];
    }
}
