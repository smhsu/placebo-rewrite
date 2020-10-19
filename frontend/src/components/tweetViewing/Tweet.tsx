import React from "react";
import he from "he";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart, faRetweet } from "@fortawesome/free-solid-svg-icons";
import { FullUser } from "twitter-d";

import { ImgWithFallback } from "./ImgWithFallback";
import { addTimeData, TimeParsedTweet } from "../../TimeParsedTweet";
import { getTweetAuthor, isPureRetweet } from "../../tweetUtils";

import "./Tweet.css";

const DEFAULT_PROFILE_PICTURE_URL =
    "https://abs.twimg.com/sticky/default_profile_images/default_profile_reasonably_small.png";

const UNKNOWN_USER: Pick<FullUser, "name" | "screen_name" | "profile_image_url_https"> = {
    name: "(Unknown user)",
    screen_name: "",
    profile_image_url_https: DEFAULT_PROFILE_PICTURE_URL,
};

interface TweetProps {
    tweet: TimeParsedTweet;
    retweeter?: string;
    hasRepliesUnder?: boolean;
}
export const Tweet = React.memo(function Tweet(props: TweetProps) {
    const { tweet, retweeter, hasRepliesUnder } = props;
    const user = getTweetAuthor(tweet, UNKNOWN_USER);
    const retweetedStatus = tweet.retweeted_status ? addTimeData([tweet.retweeted_status])[0] : null;
    if (isPureRetweet(props.tweet)) {
        return <Tweet tweet={retweetedStatus!} retweeter={user.name} hasRepliesUnder={props.hasRepliesUnder} />;
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
                    fallbackSrc={DEFAULT_PROFILE_PICTURE_URL}
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
            </div>
        </div>

    </div>;
});

interface TweetSubComponentProps {
    tweet: TimeParsedTweet;
}

interface TweetHeadingProps extends TweetSubComponentProps {
    showProfileImg?: boolean;
    style?: React.CSSProperties;
}
function TweetHeading(props: TweetHeadingProps): JSX.Element {
    const { tweet, showProfileImg, style } = props;
    const user = getTweetAuthor(tweet, UNKNOWN_USER);
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
}

function TweetText({ tweet }: TweetSubComponentProps): JSX.Element {
    const tweetText = tweet.full_text || "";
    const displayTextRange = tweet.display_text_range || [0, undefined];
    return <div>{he.decode(tweetText.substring(displayTextRange[0], displayTextRange[1]))}</div>;
}

function TweetMedia({ tweet }: TweetSubComponentProps): JSX.Element | null {
    if (!tweet.entities.media) {
        return null;
    }
    const firstMedia = tweet.entities.media[0];
    if (!firstMedia || firstMedia.source_status_id_str) { // No first media or the media is from another status
        return null;
    }

    if (firstMedia.type === "video") {
        const firstValidVariant = firstMedia.video_info?.variants?.find(
            variant => variant.content_type.startsWith("video/")
        );
        if (!firstValidVariant) {
            return null;
        }

        return <div className="embed-responsive embed-responsive-16by9">
            <video className="embed-responsive-item" controls>
                <source src={firstValidVariant.url} />
            </video>
        </div>;
    } else if (firstMedia.type === "photo") {
        return <img className="img-fluid rounded" src={firstMedia.media_url_https} alt="Attachment"/>;
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
};

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
