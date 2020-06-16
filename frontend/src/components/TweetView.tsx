import React from "react";
import { Status } from "twitter-d";
import { Tweet } from "./Tweet";
import { useTweetFilter, TweetFilterType } from "./tweetFilters/useTweetFilter";
import { ParticipantLog } from "../ParticipantLog";

import "./TweetView.css";

interface Props {
    tweets: Status[];
    log: ParticipantLog;
    settingsYOffset?: number;
}

// TODO render retweets and threads correctly
export function TweetView(props: Props) {
    const { renderedSetting, filteredTweets } = useTweetFilter(props.tweets, getFilterType(), () => {
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
}

function getFilterType(): TweetFilterType {
    for (const filterType of Object.values(TweetFilterType)) {
        if (window.location.search.includes(filterType)) {
            return filterType;
        }
    }
    return TweetFilterType.RANGE;
}
