import React from "react";
import { TweetTreeDisplay, TweetTreeNode } from "./Tweet";
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

export const TweetView = React.memo((props: Props) => {
    const condition = useExperimentalConditionFetch();
    props.log.experimentalCondition = condition;
    const [manualCondition, setManualCondition] = React.useState<ExperimentalCondition | "">("");
    const { renderedSetting, filteredTweets } = useTweetFilter(props.tweets, manualCondition || condition, () => {
        props.log.didInteractWithSetting = true;
    });

    const topLevelTweetIds = new Set<string>();
    const treeNodeForId = new Map<string, TweetTreeNode>();
    for (const tweet of filteredTweets) {
        const thread: TweetTreeNode = { tweet, children: [] };
        treeNodeForId.set(tweet.id_str, thread);
    }

    for (const tweet of filteredTweets) {
        const parentTweetId = tweet.in_reply_to_status_id_str || "";
        const parentNode = treeNodeForId.get(parentTweetId);
        if (parentNode) {
            const node = treeNodeForId.get(tweet.id_str)!;
            parentNode.children.push(node);
        } else { // Has no parent?  Then you must be top-level.
            topLevelTweetIds.add(tweet.id_str);
        }
    }

    const sortedRootNodes = Array.from(topLevelTweetIds).map(id => treeNodeForId.get(id)!)
        .sort((t1, t2) => t2.tweet.created_at_unix - t1.tweet.created_at_unix);

    return <div className="container-fluid">
        <div className="TweetView-wrapper row justify-content-center">

            <div className="TweetView-tweets-wrapper col">
                {sortedRootNodes.map(rootNode => <TweetTreeDisplay key={rootNode.tweet.id_str} node={rootNode} />)}
            </div>

            <div className="TweetView-settings-wrapper col col-sm-5 col-md-4 col-xl-3">
                <div className="TweetView-settings" style={{ top: props.settingsYOffset }}>
                    <h4 className="TweetView-settings-header">Settings</h4>
                    <div className="TweetView-settings-slider-wrapper">
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
