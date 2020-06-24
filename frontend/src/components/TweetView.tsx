import React from "react";
import { Tweet } from "./Tweet";
import { useExperimentalConditionFetch } from "./useExperimentalConditionFetch";
import { useTweetFilter } from "./tweetFilters/useTweetFilter";

import { TimeParsedTweet } from "../TimeParsedTweet";
import { ParticipantLog } from "../ParticipantLog";
import { ExperimentalCondition } from "../common/getExperimentalConditionApi";
import { getDebugOptions } from "../getDebugOptions";

import "./TweetView.css";

const isShowingConditionChooser = getDebugOptions("show_setting_chooser") === "true";
const MANUALLY_SELECTABLE_CONDITIONS: ExperimentalCondition[] = [
    ExperimentalCondition.RANDOM,
    ExperimentalCondition.RANGE,
    ExperimentalCondition.THRESHOLD,
    ExperimentalCondition.INTERVAL
];

interface Props {
    tweets: TimeParsedTweet[];
    log: ParticipantLog;
    settingsYOffset?: number;
}

// TODO render retweets and threads correctly
// TODO render settings at top if window too narrow
export const TweetView = React.memo((props: Props) => {
    const condition = useExperimentalConditionFetch();
    props.log.experimentalCondition = condition;
    const [manualCondition, setManualCondition] = React.useState<ExperimentalCondition | "">("");
    const { renderedSetting, filteredTweets } = useTweetFilter(props.tweets, manualCondition || condition, () => {
        props.log.didInteractWithSetting = true;
    });

    const sortedByTime = filteredTweets.slice();
    sortedByTime.sort((tweet1, tweet2) => tweet2.created_at_unix - tweet1.created_at_unix);

    return <div className="container-fluid">
        <div className="row justify-content-center">

            <div className="col" style={{maxWidth: 600, padding: 0}}>
                {sortedByTime.map(tweet => <Tweet key={tweet.id} tweet={tweet} />)}
            </div>

            <div className="col col-sm-5 col-md-4 col-xl-3">
                <div className="TweetView-settings" style={{ top: props.settingsYOffset }}>
                    <h4>Settings</h4>
                    {isShowingConditionChooser &&
                        <ManualConditionChooser condition={manualCondition} onChange={setManualCondition} />
                    }
                    {renderedSetting}
                </div>
            </div>

        </div>
    </div>;
});



interface ManualConditionChooserProps {
    condition: ExperimentalCondition | "";
    onChange: (condition: ExperimentalCondition | "") => void
}

function ManualConditionChooser(props: ManualConditionChooserProps) {
    const options = [<option key="" value="">(server-chosen)</option>];
    for (const condition of MANUALLY_SELECTABLE_CONDITIONS) {
        options.push(<option key={condition} value={condition}>{condition}</option>);
    }

    function handleSelectChanged(event: React.ChangeEvent<HTMLSelectElement>) {
        props.onChange(event.target.value as ExperimentalCondition | "");
    }

    return <div style={{fontSize: "small", marginBottom: 10}}>
        [Debug] choose setting kind: <select value={props.condition} onChange={handleSelectChanged}>{options}</select>
    </div>;
}
