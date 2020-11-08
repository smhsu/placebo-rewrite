import React, {forwardRef, useCallback, useEffect, useState} from "react";
import { useExperimentalConditionFetch } from "../useExperimentalConditionFetch";
import { useTweetFilter } from "../tweetFilters/useTweetFilter";

import { AugmentedTweet } from "../../AugmentedTweet";
import { ParticipantLog } from "../../ParticipantLog";
import { ExperimentalCondition } from "../../common/getExperimentalConditionApi";

import "./TweetView.css";
import {FlatTweetTreeBranch, RequestedRenderConfig} from "../tweetFilters/ITweetFilter";
import {Tweet} from "./Tweet";
import FlipMove from "react-flip-move";

const isShowingConditionChooser = process.env.REACT_APP_DEBUG_MODE === "true";

interface Props {
    tweets: AugmentedTweet[];
    log: ParticipantLog;
    settingsYOffset?: number;
}

const TweetBranchDisplay = forwardRef<HTMLDivElement, {branch: FlatTweetTreeBranch}>(function TweetBranchDisplay ({branch}, ref) {
    return <div ref={ref}>
        {branch.tweets.map((tweet, idx) => {
            if (idx + 1 !== branch.tweets.length) {
                return <Tweet key={tweet.id_str} tweet={tweet} hasRepliesUnder={true} />
            }
            return <Tweet key={tweet.id_str} tweet={tweet} hasRepliesUnder={false} />
        })}
    </div>;
});

export const TweetView = React.memo(function TweetView(props: Props) {
    const {tweets, log, settingsYOffset} = props;
    const condition = useExperimentalConditionFetch();
    log.experimentalCondition = condition;
    const [manualCondition, setManualCondition] = useState<ExperimentalCondition | "">("");
    const [data, setData] = useState(new RequestedRenderConfig());

    useEffect(() => {
        setData(new RequestedRenderConfig(tweets));
    }, [tweets]);

    const Filter = useTweetFilter(manualCondition || condition);
    const filterData = useCallback((data: RequestedRenderConfig) => {
        setData(data);
        log.didInteractWithSetting = true;
    }, [log]);

    const updateManualCondition = useCallback((newCondition: ExperimentalCondition | '') => {
        setManualCondition(newCondition);
        setData(new RequestedRenderConfig(tweets));
    }, [tweets])

    return <div className="container-fluid">
        <div className="row justify-content-center">
            <div className="TweetView-tweets-wrapper col">
                {isShowingConditionChooser &&
                    <ManualConditionChooser
                        condition={manualCondition}
                        onChange={updateManualCondition}
                        style={{ top: props.settingsYOffset }}
                    />
                }
                <FlipMove enterAnimation={false} disableAllAnimations={!data.shouldAnimate}>
                    {data.flattenedTweetTree.map(branch => <TweetBranchDisplay key={branch.rootId} branch={branch} />)}
                </FlipMove>
            </div>
            {Filter && <SettingsPanel top={settingsYOffset}>
                <Filter data={tweets} onUpdate={filterData}/>
            </SettingsPanel>}
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
