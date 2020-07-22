import React, {useRef, useEffect, useMemo} from "react";
import {Tweet, TweetThreads} from "./Tweet";
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
    const memoizedThreads = useMemo(() => {
        const sortedByTime = filteredTweets.slice();
        sortedByTime.sort((tweet1, tweet2) => tweet2.created_at_unix - tweet1.created_at_unix);
        const threads = new Map<string, TweetThreads>();
        const nodes = new Map<string, TweetThreads>();
        for (let i = sortedByTime.length - 1; i >= 0; i -= 1) {
            const tweet = sortedByTime[i];
            const targetTweetId = tweet.in_reply_to_status_id_str;
            const node: TweetThreads = { tweet, children: [] };
            if (targetTweetId) {
                if (nodes.has(targetTweetId)) {
                    // if (targetTweetId === '1267534337442033668') {
                    //     console.log(tweet.full_text);
                    // }
                    nodes.get(targetTweetId)!.children.push(node);
                    nodes.set(tweet.id_str, node);
                } else {
                    // if (targetTweetId === '1267534337442033668') {
                    //     console.log('unexpected');
                    // }
                    threads.set(tweet.id_str, node);
                    nodes.set(tweet.id_str, node);
                }
            } else {
                // if (targetTweetId === '1267534337442033668') {
                //     console.log('first time');
                // }
                threads.set(tweet.id_str, node);
                nodes.set(tweet.id_str, node);
            }
        }
        console.log('recomputed')
        const reversedThreads = new Map(Array.from(threads).reverse());
        return reversedThreads;
    }, [...filteredTweets.map(t => t.id_str).sort((a, b) => a.localeCompare(b))]);

    return <div className="container-fluid">
        <div className="TweetView-wrapper row justify-content-center">

            <div className="TweetView-tweets-wrapper col" style={{maxWidth: 600, padding: 0}}>
                {Array.from(memoizedThreads, ([key, threads]) => <Tweet key={`top-level-root-${key}`} threads={threads}/>)}
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
