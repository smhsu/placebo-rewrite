import axios from "axios";
import { mean, meanBy, minBy, maxBy } from "lodash";

import * as LogParticipantApi from "./common/logParticipantApi";
import { IParticipantLog } from "./common/logParticipantApi";
import { ExperimentalCondition } from "./common/ExperimentalCondition";
import { Tweet } from "./tweetModels/Tweet";

const QUALTRICS_QUERY_PARAM_NAME = "qualtricsID";

function getAndStoreQualtricsID(): string {
    const params = new URLSearchParams(window.location.search);
    const qualtricsID = params.get(QUALTRICS_QUERY_PARAM_NAME);
    if (qualtricsID) { // Guarantees not empty string too.
        window.sessionStorage.setItem(QUALTRICS_QUERY_PARAM_NAME, qualtricsID);
        return qualtricsID;
    } else {
        return window.sessionStorage.getItem(QUALTRICS_QUERY_PARAM_NAME) || "";
    }
}

export class ParticipantLog implements IParticipantLog {
    qualtricsID: string;
    chosenTopics: string[] = [];
    tweetStats = {
        count: 0,
        uniqueAccounts: 0,
        createdAtMean: 0,
        createdAtVariance: 0,
        createdAtRange: [0, 0] as [number, number]
    };
    experimentalCondition = ExperimentalCondition.UNKNOWN;
    didInteractWithSetting = false;
    pixelsScrolledDown = 0;
    pixelsScrolledUp = 0;

    private _hasBeenUploaded = false;

    constructor() {
        this.qualtricsID = getAndStoreQualtricsID();
    }

    logTwitterStatistics(tweets: Tweet[]) {
        const createdAtMean = meanBy(tweets, "createdAtUnix") || 0;
        this.tweetStats = {
            count: tweets.length,
            uniqueAccounts: new Set(tweets.map(tweet => tweet.raw.user.id_str)).size,
            createdAtMean: createdAtMean,
            createdAtVariance: mean(tweets.map(tweet => Math.pow(tweet.createdAtUnix - createdAtMean, 2))) || 0,
            createdAtRange: [
                minBy(tweets, "createdAtUnix")?.createdAtUnix || 0,
                maxBy(tweets, "createdAtUnix")?.createdAtUnix || 0
            ]
        };
    }

    async uploadEnsuringOnce(): Promise<void> {
        if (this._hasBeenUploaded) {
            return;
        }

        this._hasBeenUploaded = true;
        try {
            const requestPayload: LogParticipantApi.RequestPayload = { data: this };
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
