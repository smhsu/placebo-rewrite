import React, { memo, useCallback, useState } from "react";
import he from "he";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart, faRetweet } from "@fortawesome/free-solid-svg-icons";
import { FullUser, User } from "twitter-d";

import { addTimeData, TimeParsedTweet } from "../TimeParsedTweet";

import "./Tweet.css";

export interface TweetTreeNode {
    tweet: TimeParsedTweet;
    children: TweetTreeNode[];
}

const DEFAULT_PROFILE_PICTURE_URL =
    "https://abs.twimg.com/sticky/default_profile_images/default_profile_reasonably_small.png";

const UNKNOWN_USER: Pick<FullUser, "name" | "screen_name" | "profile_image_url_https"> = {
    name: "(Unknown user)",
    screen_name: "",
    profile_image_url_https: DEFAULT_PROFILE_PICTURE_URL,
};

function isFullUser(user: User): user is FullUser {
    return Object.prototype.hasOwnProperty.call(user, 'name');
}

function isPureRetweet(tweet: TimeParsedTweet): boolean {
    if (tweet.retweeted_status) {
        let retweetText = (tweet.full_text || "").trim();
        if (retweetText.length <= 0) { // Retweet with no additional comments
            return true
        }

        if (retweetText.endsWith("…")) { // Remove the "..."
            retweetText = retweetText.substring(0, retweetText.length - 1);
        }
        // Delete any "RT @someTwitterUser:" that might appear at the start
        retweetText = retweetText.replace(/^RT @\w+:/, "").trim();

        // Whether the tweet's text is entirely contained in the retweeted status's text
        return tweet.retweeted_status.full_text.indexOf(retweetText) >= 0; 
    }

    return false;
}

function toReadableNumber(num: number): string {
    if (!Number.isFinite(num)) {
        return "0";
    }

    const absValue = Math.abs(num);
    if (absValue > 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    } else if (absValue > 1000) {
        return (num / 1000).toFixed(1) + "K";
    } else {
        return num.toString();
    }
}

function getTweetAuthor(tweet: TimeParsedTweet) {
    const user = tweet.user;
    return isFullUser(user) ? user : UNKNOWN_USER;
}

function useErrorImage(firstChoice: string): [string, (() => void)] {
    const profileImgUrl = firstChoice || DEFAULT_PROFILE_PICTURE_URL;

    const [isLoadError, setIsLoadError] = useState(true);
    const [imageSrc, setImageSrc] = useState(profileImgUrl);
    const onError = useCallback(() => {
        if (isLoadError) {
            setIsLoadError(false);
            setImageSrc(DEFAULT_PROFILE_PICTURE_URL);
        }
    }, [isLoadError]);
    return [imageSrc, onError];
}

const TweetText = memo(({ tweet }: { tweet: TimeParsedTweet }) => {
    const tweetText = tweet.full_text;
    const displayTextRange = tweet.display_text_range || [0, undefined];
    return <p>{he.decode(tweetText.substring(displayTextRange[0], displayTextRange[1]))}</p>;
});

const TweetStatistics = memo(({ tweet }: { tweet: TimeParsedTweet }) => {
    return <div>
        <div className="Tweet-statistic">
            <FontAwesomeIcon icon={faRetweet}/> {toReadableNumber(tweet.retweet_count)}
        </div>
        <div className="Tweet-statistic">
            <FontAwesomeIcon icon={faHeart}/> {toReadableNumber(tweet.favorite_count)}
        </div>
    </div>;
});

const TweetHeading = memo(({ tweet }: { tweet: TimeParsedTweet }) => {
    const { name, screen_name } = getTweetAuthor(tweet);
    return <div>
        <span className="Tweet-heading-main">{name}</span>
        <span className="Tweet-heading-other">
            @{screen_name} • {tweet.created_at_description}
        </span>
    </div>;
});

const CondensedTweetHeading = memo(({ retweet }: { retweet: TimeParsedTweet }) => {
    const { name, screen_name } = getTweetAuthor(retweet);
    const user = getTweetAuthor(retweet);
    const [imageSrc, onError] = useErrorImage(user.profile_image_url_https);
    return <div className="Tweet-heading-condensed-wrapper">
        <img className="Tweet-heading-condensed-icon" src={imageSrc} onError={onError} alt="User profile"/>
        <div className="Tweet-heading-main Tweet-heading-condensed-display-name">{name}</div>
        <div className="Tweet-heading-other">@{screen_name} • {retweet.created_at_description}</div>
    </div>;
});

const Retweet = memo(({ retweet }: { retweet: TimeParsedTweet }) => {
    return <div className="Tweet-retweet-wrapper">
        <CondensedTweetHeading retweet={retweet}/>
        <TweetText tweet={retweet}/>
    </div>
});

interface TweetDisplayProps {
    tweet: TimeParsedTweet;
    retweeter?: string;
    hasRepliesUnder?: boolean;
}

const TweetDisplay = memo((props: TweetDisplayProps) => {
    const tweet = props.tweet;
    const user = getTweetAuthor(tweet);
    const [imageSrc, onError] = useErrorImage(user.profile_image_url_https);
    if(isPureRetweet(props.tweet)) {
        const retweet = addTimeData([tweet.retweeted_status!])[0];
        return <TweetDisplay tweet={retweet} retweeter={user.name} hasRepliesUnder={props.hasRepliesUnder} />;
    }

    let retweeterHeader = null;
    if (props.retweeter) {
        retweeterHeader = <div className="Tweet-retweet-header-wrapper">
            <div className='Tweet-retweet-header-icon'>
                <FontAwesomeIcon icon={faRetweet}/>
            </div>
            <div className='Tweet-retweet-header-text'>
                {props.retweeter} Retweeted
            </div>
        </div>;
    }

    let className = "Tweet-extended";
    if (!props.hasRepliesUnder) {
        className += " Tweet-bottom-border";
    }
    return <div className={className}>
        {retweeterHeader}
        <div className="Tweet">
            {props.hasRepliesUnder && <div className="Tweet-left-vertical-line" />}
            <div className="Tweet-profile">
                <img onError={onError} className="img-fluid rounded-circle" src={imageSrc} alt="User profile"/>
            </div>
            <div className="Tweet-content">
                <TweetHeading tweet={tweet}/>
                <TweetText tweet={tweet}/>
                {
                    tweet.entities.media && <img
                        className="img-fluid rounded"
                        src={tweet.entities.media[0].media_url_https}
                        alt="Attachment"/>
                }
                {
                    tweet.retweeted_status && <Retweet retweet={addTimeData([tweet.retweeted_status])[0]} />
                }
                <TweetStatistics tweet={tweet}/>
            </div>
        </div>
    </div>;
});

interface TweetNodeProps {
    node: TweetTreeNode,
}

export const TweetTreeDisplay = (props: TweetNodeProps) => {
    return <>
        <TweetDisplay tweet={props.node.tweet} hasRepliesUnder={props.node.children.length > 0} />
        {props.node.children.map(childNode =>
            <TweetTreeDisplay
                key={childNode.tweet.id_str}
                node={childNode}
            />
        )}
    </>;
};
