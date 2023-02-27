import axios from "axios";
import { Status } from "twitter-d";
import { groupBy, shuffle } from "lodash";
import { Tweet } from "./Tweet";

const DEFAULT_FEED_SIZE = 400;

const STATIC_TWEET_BASE_URL = "https://smhsu.github.io/twitter-feed-construction/downloaded_tweets/";

const FILE_NAME_FOR_TOPIC: Record<string, string> = {
    "Entertainment/Celebrities": "entertainment.json",
    "Technology"               : "technology.json",
    "News"                     : "news.json",
    "Funny/Interesting"        : "funny_interesting.json",
    "Sports"                   : "sports.json",
    "Cute/beautiful photos"    : "cute_beautiful.json"
};
const DEBUG_TWEETS_TOPIC_NAME = "Debug tweets (will override all other topics!)";
if (process.env.REACT_APP_DEBUG_MODE === "true") {
    FILE_NAME_FOR_TOPIC[DEBUG_TWEETS_TOPIC_NAME] = "";
}

export class StaticFeedMaker {
    static AVAILABLE_TOPICS = Object.keys(FILE_NAME_FOR_TOPIC);
    private readonly _feedSize: number;

    constructor(feedSize=DEFAULT_FEED_SIZE) {
        this._feedSize = feedSize;
    }

    async downloadAndBuildFeed(topics: string[]): Promise<Tweet[]> {
        if (topics.includes(DEBUG_TWEETS_TOPIC_NAME)) {
            const debugTweetImport = await import("./debugTweets.json");
            return Tweet.fromStatuses(debugTweetImport.default as unknown as Status[]);
        }

        const tweetsByTopic = await this._downloadTopics(topics);

        // Equally divide the feed among the topics.
        const singleTopicProportion = 1 / topics.length;
        const tweetsToUse = tweetsByTopic.map(tweetsInTopic =>
            this._sampleToFulfillProportion(tweetsInTopic, singleTopicProportion)
        ).flat(1);

        // Sort the thematic tweets by time.
        let feed = Tweet.fromStatuses(tweetsToUse);
        feed = Tweet.sortNewestToOldest(feed);

        for (let i = 0; i < feed.length; i++) { // Reindex
            feed[i].originalIndex = i;
        }
        return feed;
    }

    private _downloadTopics(topics: string[]): Promise<Status[][]> {
        const fileNames = topics
            .map(topic => FILE_NAME_FOR_TOPIC[topic])
            .filter(fileName => fileName !== undefined && fileName.length > 0);

        const promises: Promise<Status[]>[] = fileNames.map(fileName =>
            axios.get<Status[]>(STATIC_TWEET_BASE_URL + fileName).then(response => response.data)
        );
        return Promise.all(promises);
    }

    private _sampleToFulfillProportion(tweets: Status[], feedProportion: number): Status[] {
        const numToSample = Math.min(this._feedSize * feedProportion, tweets.length);
        const shuffled = shuffle(tweets);

        // Ragged array of tweets, each row contains tweets by one account
        const raggedTweets = Object.values(groupBy(shuffled, tweet => tweet.user.id_str));

        // Repeatedly iterate through the accounts, selecting a tweet from each account.
        // Compared to completely random sampling, accounts that don't tweet a lot will also get representation.
        let colIndex = 0;
        const sample = [];
        while (sample.length < numToSample) {
            for (const tweetsFromAccount of raggedTweets) { // For each row of raggedTweets (tweets from one account)
                if (colIndex < tweetsFromAccount.length) {
                    sample.push(tweetsFromAccount[colIndex]);
                    if (sample.length >= numToSample) {
                        break;
                    }
                }
            }
            colIndex++;
        }
        return sample;
    }
}
