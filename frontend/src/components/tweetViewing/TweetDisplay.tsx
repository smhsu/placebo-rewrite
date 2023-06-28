import React from "react";
import he from "he";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart, faRetweet } from "@fortawesome/free-solid-svg-icons";
import { ImgWithFallback } from "./ImgWithFallback";
import { Tweet, MediaType } from "../../tweetModels/Tweet";

import "./Tweet.css";

interface TweetDisplayProps {
    tweet: Tweet;
    retweeter?: string;
    hasRepliesUnder?: boolean;
}
export const TweetDisplay = React.memo(function TweetDisplay(props: TweetDisplayProps) {
    const { tweet, retweeter, hasRepliesUnder } = props;
    const user = tweet.author;
    const retweetedStatus = tweet.retweeted_status;
    if (props.tweet.isPureRetweet) {
        return <TweetDisplay tweet={retweetedStatus!} retweeter={user.name} hasRepliesUnder={props.hasRepliesUnder} />;
    }

    let className = "Tweet-outer";
    if (!props.hasRepliesUnder) {
        className += " Tweet-bottom-border";
    }

    return <div className={className}>
        {retweeter && <RetweetIndicator retweeter={retweeter} />}

        <div className="Tweet-inner">
            <div className="Tweet-profile">
                <ImgWithFallback
                    className="img-fluid rounded-circle"
                    src={user.profile_image_url_https}
                    fallbackSrc={Tweet.DEFAULT_PROFILE_PICTURE_URL}
                    alt="User profile"
                />
            </div>
            {hasRepliesUnder && <div className="Tweet-thread-indicator" />}
            <div>
                <TweetHeading tweet={tweet}/>
                <TweetText tweet={tweet}/>
                <div className="Tweet-vertical-spaced-children">
                    <TweetMedia tweet={tweet}/>
                    {retweetedStatus && <InnerTweet tweet={retweetedStatus} />}
                    <TweetStatistics tweet={tweet}/>
                </div>
                {process.env.REACT_APP_DEBUG_MODE === "true" &&
                    <div>[Debug] tweet ID: <code>{tweet.id_str}</code></div>}
            </div>
        </div>

    </div>;
});

interface TweetSubComponentProps {
    tweet: Tweet;
}

interface TweetHeadingProps extends TweetSubComponentProps {
    showProfileImg?: boolean;
    style?: React.CSSProperties;
}
function TweetHeading(props: TweetHeadingProps): JSX.Element {
    const { tweet, showProfileImg, style } = props;
    const user = tweet.author;
    return <div className="Tweet-heading" style={style}>
        {
        showProfileImg &&
            <ImgWithFallback
                src={user.profile_image_url_https}
                fallbackSrc={Tweet.DEFAULT_PROFILE_PICTURE_URL}
                alt="User profile"
            />
        }
        <span className="Tweet-heading-author">{user.name}</span>
        <span className="Tweet-heading-screen-name">@{user.screen_name} • {tweet.createdAtDescription}</span>
    </div>;
}

function TweetText({ tweet }: TweetSubComponentProps): JSX.Element {
    // Why a char array?  Because UTF-16.  The Twitter API counts Unicode code points, not bytes.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/@@iterator
    const textAsCharArray = [...tweet.text];
    function makeTextFragment(key: number, start: number, end?: number) {
        const text = textAsCharArray.slice(start, end).join("");
        return <React.Fragment key={key}>{he.decode(text)}</React.Fragment>;
    }

    const htmlElements = [];
    let fragmentStartIndex = 0;
    let key = 0;
    for (const urlEntity of tweet.urlEntities) {
        const textFragment = makeTextFragment(key, fragmentStartIndex, urlEntity.start);
        key++;
        htmlElements.push(textFragment);
        if (!urlEntity.expanded_url.startsWith("https://twitter.com")) {
            // Only display links going to non-Twitter sites.
            htmlElements.push(<a key={key} href={urlEntity.expanded_url}>{urlEntity.display_url}</a>);
            key++;
        }
        fragmentStartIndex = urlEntity.end;
    }

    if (fragmentStartIndex < tweet.text.length) {
        const textFragment = makeTextFragment(key, fragmentStartIndex);
        htmlElements.push(textFragment);
    }

    return <div style={{whiteSpace: "pre-wrap"}}>{htmlElements}</div>;
}

function TweetMedia({ tweet }: TweetSubComponentProps): JSX.Element | null {
    const mediaInfo = tweet.findFirstMedia();
    if (!mediaInfo) {
        return null;
    }

    if (mediaInfo.type === MediaType.VIDEO) {
        return <div className="embed-responsive embed-responsive-16by9">
            <video className="embed-responsive-item" controls>
                <source src={mediaInfo.url} />
            </video>
        </div>;
    } else if (mediaInfo.type === MediaType.PHOTO) {
        return <img className="img-fluid rounded" src={mediaInfo.url} alt="Attachment"/>;
    }
    return null;
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

function TweetStatistics({ tweet }: TweetSubComponentProps): JSX.Element {
    return <div>
        <div className="Tweet-statistic">
            <FontAwesomeIcon icon={faRetweet}/> {toReadableNumber(tweet.retweet_count)}
        </div>
        <div className="Tweet-statistic">
            <FontAwesomeIcon icon={faHeart}/> {toReadableNumber(tweet.favorite_count)}
        </div>
    </div>;
}

function RetweetIndicator(props: { retweeter: string }): JSX.Element {
    return <div className="Tweet-retweet-indicator">
        <div className="Tweet-retweet-indicator-icon"><FontAwesomeIcon icon={faRetweet}/></div>
        <div>{props.retweeter} Retweeted</div>
    </div>;
}

function InnerTweet({ tweet }: TweetSubComponentProps): JSX.Element {
    return <div className="Tweet-inner-tweet">
        <TweetHeading tweet={tweet} showProfileImg={true} style={{marginBottom: 3}}/>
        <TweetText tweet={tweet}/>
        <div className="Tweet-vertical-spaced-children">
            <TweetMedia tweet={tweet}/>
        </div>
    </div>;
}
