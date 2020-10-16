import React from "react";
import he from "he";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRetweet, faHeart } from "@fortawesome/free-solid-svg-icons";
import { User, FullUser } from "twitter-d";

import { TimeParsedTweet } from "../TimeParsedTweet";

import "./Tweet.css";

const DEFAULT_PROFILE_PICTURE_URL =
    "https://abs.twimg.com/sticky/default_profile_images/default_profile_reasonably_small.png";

const UNKNOWN_USER: Pick<FullUser, "name" | "screen_name" | "profile_image_url_https"> = {
    name: "(Unknown user)",
    screen_name: "",
    profile_image_url_https: DEFAULT_PROFILE_PICTURE_URL,
};

interface Props {
    tweet: TimeParsedTweet;
}

export class Tweet extends React.PureComponent<Props> {
    getTweetAuthor() {
        const user = this.props.tweet.user;
        return isFullUser(user) ? user : UNKNOWN_USER;
    }

    renderTweetText(): React.ReactElement {
        const tweet = this.props.tweet;
        const tweetText = tweet.full_text || "";
        const displayTextRange = tweet.display_text_range || [0, undefined];
        return <p>{he.decode(tweetText.substring(displayTextRange[0], displayTextRange[1]))}</p>;
    }

    renderMedia(): React.ReactElement | null {
        const tweet = this.props.tweet;
        const media = tweet.extended_entities?.media
        if (media && media[0]) {
            const firstMedia = media[0];
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
                </div>
            } else if (firstMedia.type === "photo") {
                return <img
                    className="img-fluid rounded"
                    src={firstMedia.media_url_https}
                    alt="Attachement"
                />;
            }
        }

        return null;
    }

    renderTweetHeading() {
        const { name, screen_name } = this.getTweetAuthor();
        return <div>
            <span className="Tweet-heading-main">{name} </span>
            <span className="Tweet-heading-other">
                @{screen_name} • {this.props.tweet.created_at_description}
            </span>
        </div>;
    }

    renderTweetStatistics() {
        const tweet = this.props.tweet.retweeted_status || this.props.tweet;
        return <div>
            <div className="Tweet-statistic">
                <FontAwesomeIcon icon={faRetweet} /> {toReadableNumber(tweet.retweet_count)}
            </div>
            <div className="Tweet-statistic">
                <FontAwesomeIcon icon={faHeart} /> {toReadableNumber(tweet.favorite_count)}
            </div>
        </div>;
    }

    render() {
        const tweet = this.props.tweet;
        if (tweet.retweeted_status) {
            return <Tweet tweet={tweet.retweeted_status as TimeParsedTweet} />
        }
        const user = this.getTweetAuthor();
        const profileImgUrl = user.profile_image_url_https || DEFAULT_PROFILE_PICTURE_URL;

        return <div className="Tweet">
            <div className="Tweet-profile">
                <img className="img-fluid rounded-circle" src={profileImgUrl} alt="User profile" />
            </div>
            <div className="Tweet-content">
                {this.renderTweetHeading()}
                {this.renderTweetText()}
                {this.renderMedia()}
                {this.renderTweetStatistics()}
            </div>
        </div>;
    }
}

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
