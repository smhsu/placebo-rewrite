import React from "react";
import { flatten } from "lodash";
import FlipMove from "react-flip-move";
import { useScrollLogging } from "./useScrollLogging";
import { TweetBranchDisplay } from "./TweetBranchDisplay";
import { useTweetFilter } from "../tweetFilters/useTweetFilter";
import { useInfiniteScroll } from "./useInfiniteScroll";

import { Tweet } from "../../tweetModels/Tweet";
import { ParticipantLog } from "../../ParticipantLog";
import { ExperimentalCondition } from "../../common/ExperimentalCondition";

import "./TweetView.css";

const isShowingConditionChooser = process.env.REACT_APP_DEBUG_MODE === "true";

interface Props {
    tweets: Tweet[];
    experimentCondition: ExperimentalCondition;
    log: ParticipantLog;
    settingsYOffset?: number;
}

export const TweetView = React.memo(function TweetView(props: Props) {
    const {tweets, experimentCondition, log, settingsYOffset} = props;
    const [manualCondition, setManualCondition] = React.useState<ExperimentalCondition | "">("");
    const { feedSize, resetFeedSize } = useInfiniteScroll();
    const {threads, shouldAnimateChanges, settingElement} = useTweetFilter(
        tweets,
        manualCondition || experimentCondition,
        resetFeedSize,
        () => log.numSettingInteractions++
    );
    useScrollLogging(log);


    const visibleThreads = threads.slice(0, feedSize);
    log.logTweets(flatten(visibleThreads));
    const threadElements = visibleThreads.map(branch => <TweetBranchDisplay key={branch[0].id_str} branch={branch} />);

    return <div className="container-fluid">
        <div className="row justify-content-center">
            {settingElement && <SettingsPanel top={settingsYOffset}>{settingElement}</SettingsPanel>}
            <div className="TweetView-tweets-wrapper col">
                {isShowingConditionChooser &&
                    <ManualConditionChooser
                        serverSelectedCondition={experimentCondition}
                        condition={manualCondition}
                        onChange={setManualCondition}
                        style={{ top: props.settingsYOffset }}
                    />
                }
                {shouldAnimateChanges ? <FlipMove>{threadElements}</FlipMove> : threadElements}
            </div>
        </div>
    </div>;
});

function SettingsPanel(props: React.PropsWithChildren<{top?: number}>): JSX.Element {
    const style = props.top ? { top: props.top } : undefined;
    return <div className="TweetView-settings-wrapper col col-sm-12 col-md-4 col-xl-3" style={style}>
        <div className="TweetView-settings" style={style}>
            <h4 className="TweetView-settings-header">Settings</h4>
            <div className="TweetView-settings-content">
                {props.children}
            </div>
        </div>
    </div>;
}

interface ManualConditionChooserProps {
    serverSelectedCondition: ExperimentalCondition;
    condition: ExperimentalCondition | "";
    onChange: (condition: ExperimentalCondition | "") => void
    style?: React.CSSProperties;
}

function ManualConditionChooser(props: ManualConditionChooserProps): JSX.Element {
    const options = [<option key="" value="">(server-chosen) {props.serverSelectedCondition}</option>];
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
