import moment from "moment";
import { Status } from "twitter-d";

const TIME_PARSE_STRING = "ddd MMM DD HH:mm:ss ZZ YYYY";
interface TimeData {
    created_at_unix: number;
    created_at_description: string;
}
export type TimeParsedTweet = Status & TimeData;

export function addTimeData(tweets: (Status & Partial<TimeData>)[]): TimeParsedTweet[] {
    for (const tweet of tweets) {
        const parsed = moment(tweet.created_at, TIME_PARSE_STRING);
        tweet.created_at_unix = parsed.unix();
        tweet.created_at_description = parsed.fromNow();
    }
    return (tweets as TimeParsedTweet[]);
}
