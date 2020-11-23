import moment from "moment";
import { Status } from "twitter-d";

const TIME_PARSE_STRING = "ddd MMM DD HH:mm:ss ZZ YYYY";

export interface AugmentedTweet extends Status {
    created_at_unix: number;
    created_at_description: string;
    retweeted_status?: AugmentedTweet | null;
    originalIndex: number;
}

export class TweetAugmenter {
    constructor() {
        this.augment = this.augment.bind(this);
    }

    augment(tweet: Status, index: number): AugmentedTweet {
        const result = tweet as AugmentedTweet;
        const parsed = moment(tweet.created_at, TIME_PARSE_STRING);
        result.created_at_unix = parsed.unix();
        result.created_at_description = parsed.fromNow();
        if (tweet.retweeted_status) {
            result.retweeted_status = this.augment(tweet.retweeted_status, -1);
        }
        result.originalIndex = index;
        return result;
    }

    augmentAll(tweets: Status[]): AugmentedTweet[] {
        return tweets.map(this.augment);
    }

    sortNewestToOldest(tweets: AugmentedTweet[]): AugmentedTweet[] {
        return tweets.sort((tweet1, tweet2) => tweet2.created_at_unix - tweet1.created_at_unix);
    }
}
