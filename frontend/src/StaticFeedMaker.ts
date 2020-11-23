import axios from "axios";
import { Status } from "twitter-d";
import { sampleSize } from "lodash";
import debugTweets from "./debugTweets.json";
import { Tweet } from "./Tweet";

const DEFAULT_SAMPLED_TWEETS_PROPORTION = 0.15;
const DEFAULT_FEED_SIZE = 300;

const STATIC_TWEET_BASE_URL = "https://smhsu.github.io/twitter-feed-construction/downloaded_tweets/";
const SAMPLED_TWEETS_URL = STATIC_TWEET_BASE_URL + "random.json";

const FILE_NAME_FOR_TOPIC: Record<string, string> = {
    "Entertainment/Celebrities": "entertainment.json",
    "Technology"               : "technology.json",
    "News"                     : "news.json",
    "Funny/Interesting"        : "funny_interesting.json",
    "Sports (no tweets yet)"   : "",
    "Art/Photography (no tweets yet)": ""
};
const DEBUG_TWEETS_TOPIC_NAME = "Debug tweets (will override all other topics!)";
if (process.env.REACT_APP_DEBUG_MODE === "true") {
    FILE_NAME_FOR_TOPIC[DEBUG_TWEETS_TOPIC_NAME] = "";
}

export class StaticFeedMaker {
    static AVAILABLE_TOPICS = Object.keys(FILE_NAME_FOR_TOPIC);

    private readonly _sampledTweetsProportion: number;
    private readonly _feedSize: number;

    constructor(sampledTweetsProportion=DEFAULT_SAMPLED_TWEETS_PROPORTION, feedSize=DEFAULT_FEED_SIZE) {
        this._sampledTweetsProportion = sampledTweetsProportion;
        this._feedSize = feedSize;
    }

    async downloadAndBuildFeed(topics: string[]): Promise<Tweet[]> {
        if (topics.includes(DEBUG_TWEETS_TOPIC_NAME)) {
            const augmentedTweets = Tweet.fromStatuses(debugTweets as unknown as Status[]);
            return Promise.resolve(augmentedTweets);
        }

        // First, download all the tweets.
        const fileNames = topics
            .map(topic => FILE_NAME_FOR_TOPIC[topic])
            .filter(fileName => fileName !== undefined && fileName.length > 0);

        const promises: Promise<Status[]>[] = fileNames.map(fileName =>
            axios.get<Status[]>(STATIC_TWEET_BASE_URL + fileName).then(response => response.data)
        );
        promises.push(axios.get<Status[]>(SAMPLED_TWEETS_URL).then(response => response.data));

        const tweetsByTopic = await Promise.all(promises);

        // Now, we select the tweets to use.
        // Equally divide the part of the feed dedicated to non-sampled tweets evenly among the topics.
        const desiredProportions: number[] = new Array(tweetsByTopic.length)
            .fill((1 - this._sampledTweetsProportion) / fileNames.length);

        // We know the last "topic" is the sampled tweets.
        desiredProportions[desiredProportions.length - 1] = this._sampledTweetsProportion;

        const feed = [];
        for (let i = 0; i < tweetsByTopic.length; i++) {
            const tweets = tweetsByTopic[i];
            const feedProportion = desiredProportions[i];
            const numToSample = Math.min(this._feedSize * feedProportion, tweets.length);
            feed.push(...sampleSize(tweets, numToSample));
        }

        const tweets = Tweet.sortNewestToOldest(Tweet.fromStatuses(feed));
        for (let i = 0; i < tweets.length; i++) { // Reindex
            tweets[i].originalIndex = i;
        }
        return tweets;
    }
}
