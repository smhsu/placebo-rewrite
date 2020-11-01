import React, {useCallback, useEffect, useState} from "react";
import {TweetTree} from "./TweetTree";
import { useExperimentalConditionFetch } from "../useExperimentalConditionFetch";
import { useTweetFilter } from "../tweetFilters/useTweetFilter";

import { AugmentedTweet } from "../../AugmentedTweet";
import { ParticipantLog } from "../../ParticipantLog";
import { ExperimentalCondition } from "../../common/getExperimentalConditionApi";

import "./TweetView.css";
import {ITweetFilterDataConfig} from "../tweetFilters/ITweetFilter";

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
    const [manualCondition, setManualCondition] = useState<ExperimentalCondition | "">("");
    const [updatedTweets, setUpdatedTweets] = useState<AugmentedTweet[]>([]);
    const [dataConfig, setDataConfig] = useState<ITweetFilterDataConfig | null>(null);

    useEffect(() => {
        setUpdatedTweets(tweets);
    }, [tweets]);

    const Filter = useTweetFilter(updatedTweets, manualCondition || condition);
    const filterData = useCallback((newData: AugmentedTweet[], config?: ITweetFilterDataConfig) => {
        if (config) {
            setDataConfig(config);
        } else {
            setDataConfig(null);
        }
        setUpdatedTweets(newData);
        log.didInteractWithSetting = true;
    }, [log]);

    const updateManualCondition = useCallback((newCondition: ExperimentalCondition | '') => {
        setManualCondition(newCondition);
        setUpdatedTweets(tweets);
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
                <TweetTree tweets={updatedTweets} config={dataConfig}/>
            </div>
            {Filter && <SettingsPanel top={settingsYOffset}>
                <Filter originalData={tweets} onDataUpdated={filterData}/>
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
