import React from "react";
import { AppState, ErrorInfo } from "./AppState";
import { InstructionsAndButton } from "./InstructionsAndButton";
import { TopicPicker, TopicSelectionStatuses } from "./TopicPicker";
import { StaticFeedMaker } from "../tweetModels/StaticFeedMaker";
import { Tweet } from "../tweetModels/Tweet";

interface Props {
    appState: AppState;
    errorInfo?: ErrorInfo;
    onTweetPromise: (tweetPromise: Promise<Tweet[]>) => void;
}

export function StaticTweetFlow(props: Props) {
    const {appState, errorInfo, onTweetPromise} = props;
    const [selectionStatusForTopic, setSelectionStatusForTopic] = React.useState<TopicSelectionStatuses>(
        () => initState(StaticFeedMaker.AVAILABLE_TOPICS)
    );
    const selectedTopics = Object.keys(selectionStatusForTopic)
        .filter(topic => selectionStatusForTopic[topic]);
    const handleTopicsConfirmed = () => {
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
            return <InstructionsAndButton
                errorInfo={errorInfo}
                buttonElement={<button className="btn btn-primary" onClick={handleTopicsConfirmed}>Retry</button>}
            />;
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
