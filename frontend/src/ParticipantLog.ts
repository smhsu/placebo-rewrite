import axios from "axios";
import { mean, meanBy, minBy, maxBy } from "lodash";

import * as LogParticipantApi from "./common/logParticipantApi";
import { IParticipantLog } from "./common/logParticipantApi";
import { ExperimentalCondition } from "./common/ExperimentalCondition";
import { Tweet } from "./tweetModels/Tweet";

const QUALTRICS_QUERY_PARAM_NAME = "qualtricsID";

function getAndStoreQualtricsID(urlParams: URLSearchParams): string {
    const storedQualtricsId = window.localStorage.getItem(QUALTRICS_QUERY_PARAM_NAME) || "";
    const paramsQualtricsId = urlParams.get(QUALTRICS_QUERY_PARAM_NAME);
    if (!paramsQualtricsId) {
        return storedQualtricsId;
    }

    window.localStorage.setItem(QUALTRICS_QUERY_PARAM_NAME, paramsQualtricsId);
    return paramsQualtricsId;
}

export class ParticipantLog {
    public qualtricsID: string;
    public chosenTopics: string[] = [];
    public experimentalCondition = ExperimentalCondition.UNKNOWN;
    public numSettingInteractions = 0;
    public pixelsScrolledDown = 0;
    public pixelsScrolledUp = 0;
    public maxScrollY = 0;

    /** Or, to be more precise, is uploading or has been uploaded */
    private _hasBeenUploaded = false;
    private _seenTweets = new Set<Tweet>();

    constructor(urlParams: URLSearchParams) {
        this.qualtricsID = getAndStoreQualtricsID(urlParams);
        console.log("Using Qualtrics ID of: " + this.qualtricsID);
    }

    private _calculateTweetStatistics() {
        const tweets = Array.from(this._seenTweets);
        const createdAtMean = meanBy(tweets, "createdAtUnix") || 0;
        return {
            count: tweets.length,
            uniqueAccounts: new Set(tweets.map(tweet => tweet.raw.author_id)).size,
            createdAtMean: createdAtMean,
            createdAtVariance: mean(tweets.map(tweet => Math.pow(tweet.createdAtUnix - createdAtMean, 2))) || 0,
            createdAtRange: [
                minBy(tweets, "createdAtUnix")?.createdAtUnix || 0,
                maxBy(tweets, "createdAtUnix")?.createdAtUnix || 0
            ] as [number, number]
        };
    }

    logTweets(tweets: Tweet[]) {
        for (const tweet of tweets) {
            this._seenTweets.add(tweet);
        }
    }

    async uploadEnsuringOnce(): Promise<void> {
        if (this._hasBeenUploaded) {
            return;
        }

        const serialized: IParticipantLog = {
            qualtricsID: this.qualtricsID,
            chosenTopics: this.chosenTopics,
            experimentalCondition: this.experimentalCondition,
            numSettingInteractions: this.numSettingInteractions,
            pixelsScrolledDown: this.pixelsScrolledDown,
            pixelsScrolledUp: this.pixelsScrolledUp,
            maxScrollY: this.maxScrollY,
            tweetStats: this._calculateTweetStatistics()
        };

        this._hasBeenUploaded = true;
        try {
            const requestPayload: LogParticipantApi.RequestPayload = { data: serialized };
            await axios.request({
                method: LogParticipantApi.METHOD,
                url: LogParticipantApi.PATH,
                data: requestPayload
            });
        } catch (error) {
            this._hasBeenUploaded = false;
            throw error;
        }
    }
}
