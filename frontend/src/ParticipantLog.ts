import axios from "axios";
import querystring from "querystring";

import * as LogParticipantApi from "./common/logParticipantApi";
import { IParticipantLog } from "./common/logParticipantApi";
import { ExperimentalCondition } from "./common/getExperimentalConditionApi";

const QUALTRICS_QUERY_PARAM_NAME = "qualtricsID";

function getAndStoreQualtricsID(): string {
    const queryParams = querystring.parse(window.location.search.substring(1));
    const qualtricsParam = queryParams[QUALTRICS_QUERY_PARAM_NAME];
    let qualtricsID: string;
    if (typeof qualtricsParam === "string") {
        qualtricsID = qualtricsParam;
    } else if (Array.isArray(qualtricsParam)) {
        qualtricsID = qualtricsParam[0];
    } else {
        qualtricsID = "";
    }

    if (qualtricsID.length > 0) {
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
