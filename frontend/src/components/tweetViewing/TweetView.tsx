import React from "react";
import { TweetTreeDisplay, buildTweetTrees } from "./TweetTree";
import { useExperimentalConditionFetch } from "../useExperimentalConditionFetch";
import { useTweetFilter } from "../tweetFilters/useTweetFilter";

import { AugmentedTweet } from "../../AugmentedTweet";
import { ParticipantLog } from "../../ParticipantLog";
import { ExperimentalCondition } from "../../common/getExperimentalConditionApi";

import "./TweetView.css";

const isShowingConditionChooser = process.env.REACT_APP_DEBUG_MODE === "true";

interface Props {
    tweets: AugmentedTweet[];
    log: ParticipantLog;
    settingsYOffset?: number;
}

export const TweetView = React.memo(function TweetView(props: Props) {
    const {tweets, log, settingsYOffset} = props;
    const condition = useExperimentalConditionFetch();
    log.experimentalCondition = condition;
    const [manualCondition, setManualCondition] = React.useState<ExperimentalCondition | "">("");
    const { renderedSetting, filteredTweets } = useTweetFilter(tweets, manualCondition || condition, () => {
        log.didInteractWithSetting = true;
    });

    const rootNodes = buildTweetTrees(filteredTweets);
    const sortedRootNodes = rootNodes.sort((n1, n2) => n2.tweet.created_at_unix - n1.tweet.created_at_unix);

    return <div className="container-fluid">
        <div className="row justify-content-center">

            <div className="TweetView-tweets-wrapper col">
                {isShowingConditionChooser &&
                    <ManualConditionChooser
                        condition={manualCondition}
                        onChange={setManualCondition}
                        style={{ top: props.settingsYOffset }}
                    />
                }

                {sortedRootNodes.map(rootNode => <TweetTreeDisplay key={rootNode.tweet.id_str} node={rootNode} />)}
            </div>

            {renderedSetting && <SettingsPanel top={settingsYOffset}>{renderedSetting}</SettingsPanel>}
        </div>
    </div>;
});

function SettingsPanel(props: React.PropsWithChildren<{top?: number}>): JSX.Element {
    const style = props.top ? { top: props.top } : undefined;
    return <div className="TweetView-settings-wrapper col col-sm-5 col-md-4 col-xl-3" style={style}>
        <div className="TweetView-settings" style={style}>
            <h4 className="TweetView-settings-header">Settings</h4>
            <div className="TweetView-settings-content">
                {props.children}
            </div>
        </div>
    </div>;
}

interface ManualConditionChooserProps {
    condition: ExperimentalCondition | "";
    onChange: (condition: ExperimentalCondition | "") => void
    style?: React.CSSProperties;
}

function ManualConditionChooser(props: ManualConditionChooserProps): JSX.Element {
    const options = [<option key="" value="">(server-chosen)</option>];
    for (const condition of Object.values(ExperimentalCondition)) {
        options.push(<option key={condition} value={condition}>{condition}</option>);
    }

    function handleSelectChanged(event: React.ChangeEvent<HTMLSelectElement>) {
        props.onChange(event.target.value as ExperimentalCondition | "");
    }

    return <div className="TweetView-manual-condition-chooser" style={props.style} >
        [Debug] choose setting kind: <select value={props.condition} onChange={handleSelectChanged}>{options}</select>
    </div>;
}
