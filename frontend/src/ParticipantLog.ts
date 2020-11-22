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
    experimentalCondition: ExperimentalCondition;
    didInteractWithSetting: boolean;
    private _hasBeenUploaded: boolean;

    constructor() {
        this.qualtricsID = getAndStoreQualtricsID();
        this.experimentalCondition = ExperimentalCondition.UNKNOWN;
        this.didInteractWithSetting = false;
        this._hasBeenUploaded = false;
    }

    serialize(): IParticipantLog {
        return {
            qualtricsID: this.qualtricsID,
            experimentalCondition: this.experimentalCondition,
            didInteractWithSetting: this.didInteractWithSetting
        };
    }

    async uploadEnsuringOnce(): Promise<void> {
        if (this._hasBeenUploaded) {
            return;
        }

        this._hasBeenUploaded = true;
        try {
            const requestPayload: LogParticipantApi.RequestPayload = {
                data: this.serialize()
            };
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
