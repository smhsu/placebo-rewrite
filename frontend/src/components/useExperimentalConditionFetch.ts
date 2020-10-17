import React from "react";
import axios from "axios";
import * as GetExperimentalConditionApi from "../common/getExperimentalConditionApi";
import {ExperimentalCondition} from "../common/getExperimentalConditionApi";

export function useExperimentalConditionFetch() {
    const [condition, setCondition] = React.useState(ExperimentalCondition.UNKNOWN);
    React.useEffect(() => {
        async function fetchExperimentalCondition() {
            let condition: ExperimentalCondition;
            try {
                const response = await axios.request<GetExperimentalConditionApi.ResponsePayload>({
                    method: GetExperimentalConditionApi.METHOD,
                    url: GetExperimentalConditionApi.PATH
                });
                condition = response.data.assignment;
            } catch (error) {
                // It would be nice to have a random assignment with the same chance as the server's random fallback,
                // but that config is locked up in the backend's environment variables.  In any case, the API is pretty
                // resilient so this error handler shouldn't run very often.
                console.error(error);
                condition = ExperimentalCondition.POPULARITY_SLIDER;
            }
            setCondition(condition);
        }

        if (condition === ExperimentalCondition.UNKNOWN) {
            fetchExperimentalCondition();
        }
    }, [condition]);
    
    return condition;
}
