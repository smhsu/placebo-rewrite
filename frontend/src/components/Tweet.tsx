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

interface ImgWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc: string;
}
function ImgWithFallback(props: ImgWithFallbackProps): JSX.Element {
    const {src, fallbackSrc, ...otherProps} = props;
    const [hasError, setHasError] = useState(false);
    const handleError = useCallback(() => {
        if (!hasError) {
            setHasError(true);
        }
    }, [hasError]);

    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...otherProps} src={hasError ? fallbackSrc : src} onError={handleError} />;
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

const TweetHeading = memo(({ tweet, showProfileImg, style }: { tweet: TimeParsedTweet, showProfileImg?: boolean, style?: React.CSSProperties }) => {
    const user = getTweetAuthor(tweet);
    return <div className="Tweet-heading" style={style}>
        {
        showProfileImg &&
            <ImgWithFallback
                src={user.profile_image_url_https}
                fallbackSrc={DEFAULT_PROFILE_PICTURE_URL}
                alt="User profile"
            />
        }
        <span className="Tweet-heading-author">{user.name}</span>
        <span className="Tweet-heading-screen-name">@{user.screen_name} • {tweet.created_at_description}</span>
    </div>;
});

const TweetMedia = memo(({ tweet }: { tweet: TimeParsedTweet }) => {
    if (!tweet.entities.media) {
        return null;
    }
    const firstMedia = tweet.entities.media[0];
    if (!firstMedia || firstMedia.source_status_id_str) { // No first media or the media is from another status
        return null;
    }
    return <img className="img-fluid rounded" src={firstMedia.media_url_https} alt="Attachment"/>;
});

const InnerTweet = memo(({ tweet }: { tweet: TimeParsedTweet }) => {
    return <div className="Tweet-inner-tweet">
        <TweetHeading tweet={tweet} showProfileImg={true} style={{marginBottom: 5}}/>
        <TweetText tweet={tweet}/>
        <TweetMedia tweet={tweet}/>
    </div>;
});

interface TweetDisplayProps {
    tweet: TimeParsedTweet;
    retweeter?: string;
    hasRepliesUnder?: boolean;
}

const TweetDisplay = memo((props: TweetDisplayProps) => {
    const tweet = props.tweet;
    const user = getTweetAuthor(tweet);
    if(isPureRetweet(props.tweet)) {
        const retweet = addTimeData([tweet.retweeted_status!])[0];
        return <TweetDisplay tweet={retweet} retweeter={user.name} hasRepliesUnder={props.hasRepliesUnder} />;
    }

    let retweetIndicator = null;
    if (props.retweeter) {
        retweetIndicator = <div className="Tweet-retweet-indicator">
            <div className="Tweet-retweet-indicator-icon"><FontAwesomeIcon icon={faRetweet}/></div>
            <div>{props.retweeter} Retweeted</div>
        </div>;
    }

    let className = "Tweet-outer";
    if (!props.hasRepliesUnder) {
        className += " Tweet-bottom-border";
    }
    return <div className={className}>
        {retweetIndicator}
        <div className="Tweet-inner">

            <div className="Tweet-profile">
                <ImgWithFallback
                    className="img-fluid rounded-circle"
                    src={user.profile_image_url_https}
                    alt="User profile"
                    fallbackSrc={DEFAULT_PROFILE_PICTURE_URL}
                />
            </div>
            {props.hasRepliesUnder && <div className="Tweet-thread-indicator" />}
            <div>
                <TweetHeading tweet={tweet}/>
                <TweetText tweet={tweet}/>
                <TweetMedia tweet={tweet}/>
                {tweet.retweeted_status && <InnerTweet tweet={addTimeData([tweet.retweeted_status])[0]} />}
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
