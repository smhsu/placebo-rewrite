import axios from "axios";
import { Status } from "twitter-d";
import { sampleSize, range, difference, zip } from "lodash";
import { Tweet } from "./Tweet";

const DEFAULT_UNTHEMATIC_TWEETS_PROPORTION = 0.15;
const DEFAULT_FEED_SIZE = 600;

const STATIC_TWEET_BASE_URL = "https://smhsu.github.io/twitter-feed-construction/downloaded_tweets/";
const UNTHEMATIC_TWEETS_URL = STATIC_TWEET_BASE_URL + "random.json";

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

    private readonly _unthematicTweetsProportion: number;
    private readonly _feedSize: number;

    constructor(unthematicTweetsProportion=DEFAULT_UNTHEMATIC_TWEETS_PROPORTION, feedSize=DEFAULT_FEED_SIZE) {
        this._unthematicTweetsProportion = unthematicTweetsProportion;
        this._feedSize = feedSize;
    }

    async downloadAndBuildFeed(topics: string[]): Promise<Tweet[]> {
        if (topics.includes(DEBUG_TWEETS_TOPIC_NAME)) {
            const debugTweetImport = await import("./debugTweets.json");
            return Tweet.fromStatuses(debugTweetImport.default as unknown as Status[]);
        }

        // Download all the tweets we need.
        const [tweetsByTopic, unthematicTweets] = await Promise.all([
            this._downloadTopics(topics), this._downloadUnthematicTweets()
        ]);

        // Select the thematic tweets to use.
        // Equally divide the part of the feed dedicated to thematic tweets among the topics.
        const singleTopicProportion = (1 - this._unthematicTweetsProportion) / tweetsByTopic.length;
        const topicalTweetsToUse = tweetsByTopic.map(tweetsInTopic =>
            this._sampleToFulfillProportion(tweetsInTopic, singleTopicProportion)
        ).flat(1);

        // Select the unthematic tweets to use.
        const unthematicTweetsToUse = this._sampleToFulfillProportion(
            unthematicTweets, this._unthematicTweetsProportion
        );

        // Sort the thematic tweets by time.
        let feed = Tweet.fromStatuses(topicalTweetsToUse);
        feed = Tweet.sortNewestToOldest(feed);

        // Randomly insert the unthematic tweets.
        feed = this._insertRandomly(feed, Tweet.fromStatuses(unthematicTweetsToUse));
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

    private _downloadUnthematicTweets(): Promise<Status[]> {
        return axios.get<Status[]>(UNTHEMATIC_TWEETS_URL).then(response => response.data);
    }

    private _sampleToFulfillProportion<T>(items: T[], feedProportion: number): T[] {
        const numToSample = Math.min(this._feedSize * feedProportion, items.length);
        return sampleSize(items, numToSample);
    }

    /**
     * Makes a new array made by randomly inserting elements from the second array into the first.  More formally,
     * if element X would appear before element Y in the first array, then indexOf(X) < indexOf(Y) in the merged array.
     *
     * @param a - first array
     * @param b - second array whose elements to randomly insert into the first
     * @return a new array containing the elements of the original arrays interspersed in a random order
     */
    private _insertRandomly<T>(a: T[], b: T[]): T[] {
        const possibleIndices = range(a.length + b.length);
        const indicesToPutA = sampleSize(possibleIndices, a.length).sort((a, b) => a - b);
        const indicesToPutB = difference(possibleIndices, indicesToPutA).sort((a, b) => a - b);
        const merged = new Array(possibleIndices.length);

        for (const [element, index] of zip(a, indicesToPutA)) {
            merged[index as number] = element;
        }
        for (const [element, index] of zip(b, indicesToPutB)) {
            merged[index as number] = element;
        }

        return merged;
    }
}
