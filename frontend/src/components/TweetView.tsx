import React from "react";
import { Status } from "twitter-d";
import { Tweet } from "./Tweet";
import { useTweetFilter } from "./tweetFilters/useTweetFilter";
import { ParticipantLog } from "../ParticipantLog";
import { ExperimentalCondition } from "../common/getExperimentalConditionApi";
import { useExperimentalConditionFetch } from "./useExperimentalConditionFetch";

import "./TweetView.css";

interface Props {
    tweets: Status[];
    log: ParticipantLog;
    settingsYOffset?: number;
}

// TODO render retweets and threads correctly
// TODO render settings at top if window too narrow
export const TweetView = React.memo((props: Props) => {
    const condition = useExperimentalConditionFetch();
    props.log.experimentalCondition = condition;
    const { renderedSetting, filteredTweets } = useTweetFilter(props.tweets, condition, () => {
        props.log.didInteractWithSetting = true;
    });

    return <div className="container-fluid">
        <div className="row justify-content-center">

            <div className="col" style={{maxWidth: 600, padding: 0}}>
                {filteredTweets.map(tweet => <Tweet key={tweet.id} tweet={tweet} />)}
            </div>

            <div className="col col-sm-5 col-md-4 col-xl-3">
                <div className="TweetView-settings" style={{ top: props.settingsYOffset }}>
                    <h4>Settings</h4>
                    {renderedSetting}
                </div>
            </div>

        </div>
    </div>;
});
