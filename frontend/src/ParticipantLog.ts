import axios from "axios";

import * as LogParticipantApi from "./common/logParticipantApi";
import { IParticipantLog } from "./common/logParticipantApi";
import { ExperimentalCondition } from "./common/ExperimentalCondition";

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
    experimentalCondition = ExperimentalCondition.UNKNOWN;
    didInteractWithSetting = false;
    pixelsScrolledDown = 0;
    pixelsScrolledUp = 0;
    private _hasBeenUploaded = false;

    constructor() {
        this.qualtricsID = getAndStoreQualtricsID();
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
