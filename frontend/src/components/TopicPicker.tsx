import React from "react";
import { shuffle, sampleSize } from "lodash";
import { Status } from "twitter-d";

import "./TopicPicker.css";
import entertainmentTweets from "../static_tweets/entertainment.hydrated.json";
import newsTweets from "../static_tweets/news.hydrated.json";
import techTweets from "../static_tweets/technology.hydrated.json";
import funnyTweets from "../static_tweets/funny_interesting.hydrated.json";
import randomTweets from "../static_tweets/random.hydrated.json";
import debugTweets from "../static_tweets/debugTweets.json";

const FEED_SIZE = 200;

const TWEETS_FOR_TOPIC: Record<string, Status[]> = {
    "Entertainment/Celebrities": entertainmentTweets as unknown as Status[],
    "Technology"               : techTweets as unknown as Status[],
    "News"                     : newsTweets as unknown as Status[],
    "Funny/Interesting"        : funnyTweets as unknown as Status[],
    "Sports (no tweets yet)"   : [],
    "Art/Photography (no tweets yet)": []
};
if (process.env.REACT_APP_USE_DEBUG_QUERY_PARAMS === "true") {
    TWEETS_FOR_TOPIC["Debug tweets"] = debugTweets as unknown as Status[];
}

const topicNames = Object.keys(TWEETS_FOR_TOPIC);
const shuffledTopics = shuffle(topicNames);
// Object mapping from each topic as a key to `false` as a value.
const topicsToFalse = topicNames.reduce<Record<string, boolean>>((obj, topic) => {
    obj[topic] = false;
    return obj;
}, {});

function constructFeed(topics: string[]): Status[] {
    if (topics.length === 0) { // Only random tweets then...
        return sampleSize(randomTweets as unknown as Status[], FEED_SIZE);
    }
    if (topics.length === 1 && topics[0] === "Debug tweets") {
        return TWEETS_FOR_TOPIC[topics[0]];
    }

    const randomProportion = 0.2;
    const feed = sampleSize<Status>(randomTweets as unknown as Status[], FEED_SIZE * randomProportion);
    const otherTopicProportions = 0.8 / topics.length;
    for (const topic of topics) {
        const numToSample = Math.min(FEED_SIZE * otherTopicProportions, TWEETS_FOR_TOPIC[topic].length);
        feed.push(...sampleSize(TWEETS_FOR_TOPIC[topic], numToSample));
    }
    return shuffle(feed);
}

function makeConfirmButtonText(numTopicsSelected: number) {
    if (numTopicsSelected <= 0) {
        return "Select at least one topic to continue";
    } else if (numTopicsSelected === 1) {
        return `Confirm selection of 1 topic`;
    } else {
        return `Confirm selection of ${numTopicsSelected} topics`;
    }
}

export function TopicPicker(props: {onTweets: (tweets: Status[]) => void}): React.ReactElement {
    const [checkStatuses, setCheckStatuses] = React.useState<Record<string, boolean>>(topicsToFalse);
    const setCheckedForTopic = React.useCallback((topic: string, isChecked: boolean) => {
        setCheckStatuses(prevChecked => ({...prevChecked, [topic]: isChecked}))
    }, [setCheckStatuses]);
    const numberChecked = Object.values(checkStatuses).reduce<number>((count, isChecked) =>
        isChecked ? count + 1 : count
    , 0);
    const handleConfirmPressed = () => {
        const checkedTopics = Object.keys(topicsToFalse).filter(topic => checkStatuses[topic]);
        props.onTweets(constructFeed(checkedTopics));
    };

    return <div className="container TopicPicker">
        <h2 className="TopicPicker-main-heading">Build your feed</h2>
        <p className="TopicPicker-instructions">
            Please pick one or more topics of tweets you would be interested in.  Each topic contians tweets written by
            Twitter accounts relevant to that topic.  We hand-picked the accounts in each topic.
        </p>
        {
            shuffledTopics.map(topic => {
                const id = "TopicPicker-" + topic;
                return <div key={topic}>
                    <input
                        id={id}
                        type="checkbox"
                        checked={checkStatuses[topic]}
                        onChange={event => setCheckedForTopic(topic, event.target.checked)}/>
                    <label htmlFor={id} style={{fontWeight: checkStatuses[topic] ? "bold" : undefined}}>{topic}</label>
                </div>;
            })
        }

        <button className="btn btn-primary" disabled={numberChecked === 0} onClick={handleConfirmPressed}>
            {makeConfirmButtonText(numberChecked)}
        </button>
    </div>;
}
