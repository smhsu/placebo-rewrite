import React from "react";
import { AppState, ErrorInfo } from "../AppState";
import { ErrorDisplay } from "./ErrorDisplay";
import { TopicPicker, TopicSelectionStatuses } from "./TopicPicker";
import { StaticFeedMaker } from "../../tweetModels/StaticFeedMaker";
import { Tweet } from "../../tweetModels/Tweet";
import { ParticipantLog } from "../../ParticipantLog";

interface Props {
    appState: AppState;
    errorInfo?: ErrorInfo;
    log: ParticipantLog;
    onTweetPromise: (tweetPromise: Promise<Tweet[]>) => void;
}

export function StaticTweetFlow(props: Props) {
    const {appState, errorInfo, log, onTweetPromise} = props;
    const [selectionStatusForTopic, setSelectionStatusForTopic] = React.useState<TopicSelectionStatuses>(
        () => initState(StaticFeedMaker.AVAILABLE_TOPICS)
    );
    const selectedTopics = Object.keys(selectionStatusForTopic)
        .filter(topic => selectionStatusForTopic[topic]);
    const handleTopicsConfirmed = () => {
        log.chosenTopics = selectedTopics;
        if (selectedTopics.length > 0) {
            onTweetPromise(new StaticFeedMaker().downloadAndBuildFeed(selectedTopics));
        } else {
            console.warn(
                "No topics selected; the retry button does nothing.  If you expected topics to be selected, " +
                "it could be because this component was unmounted, making it lose all state."
            );
        }
    }

    switch (appState) {
        case AppState.START:
            return <TopicPicker
                selectionStatuses={selectionStatusForTopic}
                onSelectionChanged={setSelectionStatusForTopic}
                onTopicsConfirmed={handleTopicsConfirmed}
            />;
        case AppState.ERROR:
            return <div className="container vertical-center">
                {errorInfo && <ErrorDisplay errorInfo={errorInfo} />}
                <button className="btn btn-primary" onClick={handleTopicsConfirmed}>Retry</button>
            </div>;
        default:
            return null;
    }
}

/**
 * @param topics
 * @return object mapping from each topic as a key to `false`.
 */
function initState(topics: string[]): TopicSelectionStatuses {
    const mapping: TopicSelectionStatuses = {};
    for (const topic of topics) {
        mapping[topic] = false;
    }
    return mapping;
}
