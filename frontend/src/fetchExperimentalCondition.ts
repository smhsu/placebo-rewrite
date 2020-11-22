import axios from "axios";
import { ExperimentalCondition, getRandomCondition } from "./common/ExperimentalCondition";
import * as GetExperimentalConditionApi from "./common/getExperimentalConditionApi";

export async function fetchExperimentalCondition(): Promise<ExperimentalCondition> {
    try {
        const response = await axios.request<GetExperimentalConditionApi.ResponsePayload>({
            method: GetExperimentalConditionApi.METHOD,
            url: GetExperimentalConditionApi.PATH
        });
        return response.data.assignment;
    } catch (error) {
        console.error(error);
        return getRandomCondition();
    }
}
