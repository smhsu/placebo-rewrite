import React from "react";
import { TweetTreeDisplay, buildTweetTrees } from "./TweetTree";
import { useExperimentalConditionFetch } from "../useExperimentalConditionFetch";
import { useTweetFilter } from "../tweetFilters/useTweetFilter";

import { AugmentedTweet } from "../../AugmentedTweet";
import { ParticipantLog } from "../../ParticipantLog";
import { ExperimentalCondition } from "../../common/getExperimentalConditionApi";

import "./TweetView.css";

const isShowingConditionChooser = process.env.REACT_APP_DEBUG_MODE === "true";
const MANUALLY_SELECTABLE_CONDITIONS: ExperimentalCondition[] = [
    ExperimentalCondition.RANDOM,
    ExperimentalCondition.RANGE,
    ExperimentalCondition.THRESHOLD,
    ExperimentalCondition.INTERVAL
];

interface Props {
    tweets: AugmentedTweet[];
    log: ParticipantLog;
    settingsYOffset?: number;
}

export const TweetView = React.memo((props: Props) => {
    const condition = useExperimentalConditionFetch();
    props.log.experimentalCondition = condition;
    const [manualCondition, setManualCondition] = React.useState<ExperimentalCondition | "">("");
    const { renderedSetting, filteredTweets } = useTweetFilter(props.tweets, manualCondition || condition, () => {
        props.log.didInteractWithSetting = true;
    });

    const rootNodes = buildTweetTrees(filteredTweets);
    const sortedRootNodes = rootNodes.sort((n1, n2) => n2.tweet.created_at_unix - n1.tweet.created_at_unix);

    return <div className="container-fluid">
        <div className="row justify-content-center">

            <div className="TweetView-tweets-wrapper col">
                {sortedRootNodes.map(rootNode => <TweetTreeDisplay key={rootNode.tweet.id_str} node={rootNode} />)}
            </div>

            <div
                className="TweetView-settings-wrapper col col-sm-5 col-md-4 col-xl-3"
                style={{ top: props.settingsYOffset }}
            >
                <div className="TweetView-settings" style={{ top: props.settingsYOffset }}>
                    <h4 className="TweetView-settings-header">Settings</h4>
                    <div className="TweetView-settings-content">
                        {
                        isShowingConditionChooser &&
                            <ManualConditionChooser condition={manualCondition} onChange={setManualCondition} />
                        }
                        {renderedSetting}
                    </div>
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
