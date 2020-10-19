import moment from "moment";
import { Status } from "twitter-d";

const TIME_PARSE_STRING = "ddd MMM DD HH:mm:ss ZZ YYYY";

export interface TimeParsedTweet extends Status {
    created_at_unix: number;
    created_at_description: string;
    retweeted_status?: TimeParsedTweet | null;
}

export function addTimeData(tweet: Status): TimeParsedTweet {
    const result: TimeParsedTweet = tweet as TimeParsedTweet;
    const parsed = moment(tweet.created_at, TIME_PARSE_STRING);
    result.created_at_unix = parsed.unix();
    result.created_at_description = parsed.fromNow();
    if (result.retweeted_status) {
        result.retweeted_status = addTimeData(result.retweeted_status);
    }
    return result;
}
