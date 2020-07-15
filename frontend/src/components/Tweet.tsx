import React, {memo, ReactNode} from "react";
import he from "he";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faHeart, faRetweet} from "@fortawesome/free-solid-svg-icons";
import {FullUser, User} from "twitter-d";

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
    const profileImgUrl = user.profile_image_url_https || DEFAULT_PROFILE_PICTURE_URL;
    return <div className="Tweet-heading-condensed-wrapper">
        <div className="Tweet-heading-condensed-icon" style={{ backgroundImage: profileImgUrl }}/>
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
    borderless?: boolean;
    leftBar?: boolean;
}

const SingleTweet = memo((props: Props) => {
    const tweet = props.tweet;
    const user = getTweetAuthor(tweet);
    const profileImgUrl = user.profile_image_url_https || DEFAULT_PROFILE_PICTURE_URL;

    return <div className={props.borderless ? '' : "Tweet-extended"}>
        <div className="Tweet">
            {props.leftBar && <div className="Tweet-left-vertical-line"/>}
            <div className="Tweet-profile">
                <img className="img-fluid rounded-circle" src={profileImgUrl} alt="User profile"/>
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

function constructTreeBranch(
    tweets: { element: ReactNode, id: string }[],
    topBorder = false,
    bottomBorder = true,
    sideBorders = true
) {
    const firstId = tweets[0].id;
    const lastId = tweets[tweets.length - 1].id;
    let className = 'Tweet-extended';
    if (!topBorder) {
        className += ' Tweet-no-top-border';
    }
    if (!bottomBorder) {
        className += ' Tweet-no-bottom-border';
    }
    if (!sideBorders) {
        className += ' Tweet-no-side-borders';
    }
    return (
        <div
            className={className}
            key={`branch-of-tree-from-${firstId}-to-${lastId}`}
        >
            {tweets.map(item => item.element)}
        </div>
    );
}

// assumptions: no retweets in reply; no tweets with duplicate id
function generateTweetsTree(
    threads: TweetThreads,
    allowTopmostBorder: boolean,
    allowBottommostBorder: boolean,
    allowSideBorders: boolean,
    ignoreRoot: boolean
) {
    const stack: TweetThreads[] = [];
    const branches: ReactNode[] = [];
    let cached: TimeParsedTweet[] = [];
    let shouldIgnoreRoot = ignoreRoot;

    function processCached() {
        const currentBranch = cached.map((tweet, index) => {
            const isEnd = index === cached.length - 1;
            return {
                element: <SingleTweet key={`tweet-in-tree-${tweet.id_str}`} tweet={tweet} leftBar={!isEnd} borderless/>,
                id: tweet.id_str
            }
        });
        const isFirstBranch = branches.length === 0;
        const isLastBranch = stack.length === 0;
        branches.push(
            constructTreeBranch(
                currentBranch,
                isFirstBranch ? allowTopmostBorder : false,
                isLastBranch ? allowBottommostBorder : true,
                allowSideBorders
            )
        );
        cached = [];
    }

    stack.push(threads);
    while (stack.length > 0) {
        const currentNode = stack.pop()!;
        stack.push(...currentNode.children);
        if (shouldIgnoreRoot) {
            shouldIgnoreRoot = false;
            continue;
        }
        cached.push(currentNode.tweet);
        if (currentNode.children.length === 0 && cached.length > 0) {
            if (threads.tweet.id_str === '126869319596741836900000') {
                console.log(cached.map(t => t.full_text))
            }
            processCached();
        }
    }
    if (cached.length > 0) {
        processCached();
    }
    return branches;
}

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
        <div className="Tweet-extended Tweet-no-bottom-border">
            <div className="Tweet-retweet-header-wrapper">
                <div className='Tweet-retweet-header-icon'>
                    <FontAwesomeIcon icon={faRetweet}/>
                </div>
                <div className='Tweet-retweet-header-text'>
                    {displayName} Retweeted
                </div>
            </div>
            <SingleTweet tweet={retweet} leftBar={threads.children.length > 0} borderless/>
            {generateTweetsTree(threads, false, true, false, true)}
        </div>
    )
});

export const Tweet = memo(({ threads }: { threads: TweetThreads }) => {
    const mainTweet = threads.tweet;
    if (mainTweet.retweeted_status && isEmpty(mainTweet.full_text)) {
        const wellFormedTweet = addTimeData([mainTweet.retweeted_status])[0];
        return (
            <RetweetHeaderOnly retweet={wellFormedTweet} threads={threads}/>
        )
    } else {
        return (
            <div>
                {generateTweetsTree(threads, true, true, true, false)}
            </div>
        )
    }
});

