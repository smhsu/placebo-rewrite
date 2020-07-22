import React, {memo, useCallback, useState} from "react";
import he from "he";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faHeart, faRetweet} from "@fortawesome/free-solid-svg-icons";
import {FullUser, Status, User} from "twitter-d";

import {addTimeData, TimeParsedTweet} from "../TimeParsedTweet";

import "./Tweet.css";

export interface TweetThreads {
    tweet: TimeParsedTweet;
    children: TweetThreads[];
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

function isEmpty(text: string) {
    if (text === null || text === undefined) {
        return true;
    }
    return text.trim() === '';
}

function isFormattedEmpty(parentTweetContent: string, originalTweet: Status) {
    let baseContent = parentTweetContent.trim();
    if (baseContent.endsWith('…')) {
        baseContent = baseContent.substring(0, baseContent.length - 1);
    }
    const screenName = isFullUser(originalTweet.user) ? originalTweet.user.screen_name : UNKNOWN_USER.screen_name;
    const originalTweetContent = originalTweet.full_text.trim();
    const formattedContent = `RT @${screenName}: ${originalTweetContent}`;
    return formattedContent.startsWith(baseContent);
}

function isPureRetweet(tweet: TimeParsedTweet) {
    return tweet.retweeted_status &&
        (isEmpty(tweet.full_text) ||
        isFormattedEmpty(tweet.full_text, tweet.retweeted_status));
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
        <span className="Tweet-heading-main">{name} </span>
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
        <img className="Tweet-heading-condensed-icon" src={imageSrc} onError={onError} alt={'user profile'}/>
        <div className="Tweet-heading-main Tweet-heading-condensed-display-name">{name} </div>
        <div className="Tweet-heading-other">@{screen_name} • {retweet.created_at_description}</div>
    </div>
});

const Retweet = memo(({ retweet }: { retweet: TimeParsedTweet }) => {
    return <div className="Tweet-retweet-wrapper">
        <CondensedTweetHeading retweet={retweet}/>
        <TweetText tweet={retweet}/>
    </div>
});

interface Props {
    tweet: TimeParsedTweet;
    className?: string
    leftBar?: boolean;
}

const SingleTweet = memo((props: Props) => {
    const tweet = props.tweet;
    const user = getTweetAuthor(tweet);
    const [imageSrc, onError] = useErrorImage(user.profile_image_url_https);

    return <div className={props.className ?? "Tweet-extended"}>
        <div className="Tweet">
            {props.leftBar && <div className="Tweet-left-vertical-line"/>}
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
                    tweet.retweeted_status && <Retweet retweet={addTimeData([tweet.retweeted_status])[0]}/>
                }
                <TweetStatistics tweet={tweet}/>
            </div>
        </div>
    </div>;
});

interface TweetTreeProps {
    node: TweetThreads,
    ignoreTopBorder: boolean,
    ignoreBottomBorder: boolean,
    ignoreRoot: boolean,
    isRoot: boolean
}

const TweetTree = (props: TweetTreeProps) => {
    const result = [];
    let className = 'Tweet-extended';
    if (props.ignoreTopBorder) {
        className += ' Tweet-no-top-border';
    }
    if (props.ignoreBottomBorder) {
        className += ' Tweet-no-bottom-border';
    }
    if (!(props.isRoot && props.ignoreRoot)) {
        result.push(
            <SingleTweet
                key={`single-tweet-${props.node.tweet.id_str}`}
                tweet={props.node.tweet}
                className={className}
                leftBar={props.node.children.length > 0}
            />
        );
    }
    for (const childNode of props.node.children) {
        result.push(
            <TweetTree
                key={`chilren-branch-tweet-${childNode.tweet.id_str}`}
                node={childNode}
                ignoreTopBorder={true}
                ignoreBottomBorder={childNode.children.length > 0}
                ignoreRoot={false}
                isRoot={false}
            />
        )
    }
    return (
        <>{result}</>
    )
};

const RetweetHeaderOnly = memo(({ retweet, threads }: { retweet: TimeParsedTweet, threads: TweetThreads }) => {
    const baseTweet = threads.tweet;
    let displayName: string;
    if (isFullUser(baseTweet.user)) {
        displayName = baseTweet.user.name;
    } else {
        console.error(`FullUser not found for tweet ${baseTweet.id_str}`);
        displayName = baseTweet.user.id_str;
    }
    return (
        <>
            <div className='Tweet-extended Tweet-no-bottom-border'>
                <div className="Tweet-retweet-header-wrapper">
                    <div className='Tweet-retweet-header-icon'>
                        <FontAwesomeIcon icon={faRetweet}/>
                    </div>
                    <div className='Tweet-retweet-header-text'>
                        {displayName} Retweeted
                    </div>
                </div>
                <SingleTweet tweet={retweet} leftBar={threads.children.length > 0} className={''}/>
            </div>
            <TweetTree
                node={threads}
                ignoreRoot={true}
                ignoreTopBorder={true}
                ignoreBottomBorder={threads.children.length > 0}
                isRoot={true}
            />
        </>
    )
});

export const Tweet = memo(({ threads }: { threads: TweetThreads }) => {
    const mainTweet = threads.tweet;
    if (mainTweet.id_str === '1267534335340666895') {
        console.log('a', threads)
    }
    if (isPureRetweet(mainTweet)) {
        const wellFormedTweet = addTimeData([mainTweet.retweeted_status!])[0];
        return (
            <RetweetHeaderOnly retweet={wellFormedTweet} threads={threads}/>
        )
    } else {
        return (
            <TweetTree
                node={threads}
                ignoreRoot={false}
                ignoreTopBorder={false}
                ignoreBottomBorder={threads.children.length > 0}
                isRoot={true}
            />
        )
    }
});

