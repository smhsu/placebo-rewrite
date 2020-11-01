import React from "react";
import { shuffle } from "lodash";

import "./TopicPicker.css";

export type TopicSelectionStatuses = Record<string, boolean>;

interface TopicPickerProps {
    selectionStatuses: TopicSelectionStatuses;
    onSelectionChanged: React.Dispatch<React.SetStateAction<TopicSelectionStatuses>>;
    onTopicsConfirmed?: () => void;
}

export function TopicPicker(props: TopicPickerProps): React.ReactElement {
    const {selectionStatuses, onSelectionChanged, onTopicsConfirmed} = props;
    const setCheckedForTopic = React.useCallback((topic: string, isSelected: boolean) => {
        onSelectionChanged(prevSelection => ({...prevSelection, [topic]: isSelected}));
    }, [onSelectionChanged]);
    const numberChecked = Object.values(selectionStatuses).reduce<number>((count, isChecked) =>
        isChecked ? count + 1 : count
    , 0);
    const shuffledTopics = React.useRef(shuffle(Object.keys(selectionStatuses)));

    return <div className="container TopicPicker">
        <h2 className="TopicPicker-main-heading">Build your feed</h2>
        <p className="TopicPicker-instructions">
            Please pick one or more topics of tweets you would be interested in.  Each topic contains tweets written by
            Twitter accounts relevant to that topic.  We hand-picked the accounts in each topic.
        </p>
        {
            shuffledTopics.current.map(topic => {
                const id = "TopicPicker-" + topic;
                return <div key={topic}>
                    <input
                        id={id}
                        type="checkbox"
                        checked={selectionStatuses[topic]}
                        onChange={event => setCheckedForTopic(topic, event.target.checked)}/>
                    <label
                        htmlFor={id}
                        style={{fontWeight: selectionStatuses[topic] ? "bold" : undefined}}
                    >
                        {topic}
                    </label>
                </div>;
            })
        }

        <button className="btn btn-primary" disabled={numberChecked === 0} onClick={onTopicsConfirmed}>
            {makeConfirmButtonText(numberChecked)}
        </button>
    </div>;
}

function makeConfirmButtonText(numTopicsSelected: number): string {
    if (numTopicsSelected <= 0) {
        return "Select at least one topic to continue";
    } else if (numTopicsSelected === 1) {
        return `Confirm selection of 1 topic`;
    } else {
        return `Confirm selection of ${numTopicsSelected} topics`;
    }
}
