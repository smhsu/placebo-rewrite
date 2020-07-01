import React, {memo} from "react";
import he from "he";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRetweet, faHeart } from "@fortawesome/free-solid-svg-icons";
import { User, FullUser } from "twitter-d";

import {addTimeData, TimeParsedTweet} from "../TimeParsedTweet";

import "./Tweet.css";

const DEFAULT_PROFILE_PICTURE_URL =
    "https://abs.twimg.com/sticky/default_profile_images/default_profile_reasonably_small.png";

const UNKNOWN_USER: Pick<FullUser, "name" | "screen_name" | "profile_image_url_https"> = {
    name: "(Unknown user)",
    screen_name: "",
    profile_image_url_https: DEFAULT_PROFILE_PICTURE_URL,
};

function getTweetAuthor(tweet: TimeParsedTweet) {
    const user = tweet.user;
    return isFullUser(user) ? user : UNKNOWN_USER;
}

const TweetText = memo(({tweet}: {tweet: TimeParsedTweet}) => {
    const tweetText = tweet.full_text;
    const displayTextRange = tweet.display_text_range || [0, undefined];
    return <p>{he.decode(tweetText.substring(displayTextRange[0], displayTextRange[1]))}</p>;
});

const TweetStatistics = memo(({tweet}: {tweet: TimeParsedTweet}) => {
    return <div>
        <div className="Tweet-statistic">
            <FontAwesomeIcon icon={faRetweet} /> {toReadableNumber(tweet.retweet_count)}
        </div>
        <div className="Tweet-statistic">
            <FontAwesomeIcon icon={faHeart} /> {toReadableNumber(tweet.favorite_count)}
        </div>
    </div>;
});

const TweetHeading = memo(({tweet}: {tweet: TimeParsedTweet}) => {
    const { name, screen_name } = getTweetAuthor(tweet);
    return <div>
        <span className="Tweet-heading-main">{name} </span>
        <span className="Tweet-heading-other">
                @{screen_name} • {tweet.created_at_description}
            </span>
    </div>;
});

const CondensedTweetHeading = memo(({retweet}: {retweet: TimeParsedTweet}) => {
    const { name, screen_name } = getTweetAuthor(retweet);
    const user = getTweetAuthor(retweet);
    const profileImgUrl = user.profile_image_url_https || DEFAULT_PROFILE_PICTURE_URL;
    return <div className="Tweet-heading-condensed-wrapper">
        <div className="Tweet-heading-condensed-icon" style={{backgroundImage: profileImgUrl}}/>
        <div className="Tweet-heading-main Tweet-heading-condensed-display-name">{name} </div>
        <div className="Tweet-heading-other">@{screen_name} • {retweet.created_at_description}</div>
    </div>
});

const Retweet = memo(({retweet}: {retweet: TimeParsedTweet}) => {
    return <div className="Tweet-retweet-wrapper">
        <CondensedTweetHeading retweet={retweet}/>
        <TweetText tweet={retweet}/>
    </div>
});

interface Props {
    tweet: TimeParsedTweet;
    threads: TimeParsedTweet[];
    borderless?: boolean
}

export const Tweet = memo((props: Props) => {
    const tweet = props.tweet;
    const user = getTweetAuthor(tweet);
    const profileImgUrl = user.profile_image_url_https || DEFAULT_PROFILE_PICTURE_URL;

    return <div className={props.borderless ? '' : "Tweet-extended"}>
        <div className="Tweet">
            {
                props.threads.length > 0 && <div className="Tweet-left-vertical-line"/>
            }
            <div className="Tweet-profile">
                <img className="img-fluid rounded-circle" src={profileImgUrl} alt="User profile" />
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
        {
            props.threads.map(reply => <Tweet key={`replied-${tweet.id_str}`} tweet={reply} threads={[]} borderless/>)
        }
    </div>;
})

function isFullUser(user: User): user is FullUser {
    return typeof (user as FullUser).name === "string";
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
