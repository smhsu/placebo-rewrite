import React from "react";
import moment from "moment";
import he from "he";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRetweet, faHeart } from "@fortawesome/free-solid-svg-icons";
import { Status, User, FullUser } from "twitter-d";

import "./Tweet.css";

const DEFAULT_PROFILE_PICTURE_URL =
    "https://abs.twimg.com/sticky/default_profile_images/default_profile_reasonably_small.png";

const UNKNOWN_USER: Pick<FullUser, "name" | "screen_name" | "profile_image_url_https"> = {
    name: "(Unknown user)",
    screen_name: "",
    profile_image_url_https: DEFAULT_PROFILE_PICTURE_URL,
};

export const TIME_PARSE_STRING = "ddd MMM DD HH:mm:ss ZZ YYYY";

interface Props {
    tweet: Status;
}

export class Tweet extends React.PureComponent<Props> {
    getTweetAuthor() {
        const user = this.props.tweet.user;
        return isFullUser(user) ? user : UNKNOWN_USER;
    }

    renderTweetText(): React.ReactElement {
        const tweet = this.props.tweet;
        const tweetText = tweet.full_text;
        const displayTextRange = tweet.display_text_range || [0, undefined];
        return <p>{he.decode(tweetText.substring(displayTextRange[0], displayTextRange[1]))}</p>;
    }

    renderTweetHeading() {
        const parsedTime = moment(this.props.tweet.created_at, TIME_PARSE_STRING);
        const { name, screen_name } = this.getTweetAuthor();
        return <div>
            <span className="Tweet-heading-main">{name} </span>
            <span className="Tweet-heading-other">
                @{screen_name} • {parsedTime.fromNow()}
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
        const user = this.getTweetAuthor();
        const profileImgUrl = user.profile_image_url_https || DEFAULT_PROFILE_PICTURE_URL;

        return <div className="Tweet">
            <div className="Tweet-profile">
                <img className="img-fluid rounded-circle" src={profileImgUrl} alt="User profile" />
            </div>
            <div className="Tweet-content">
                {this.renderTweetHeading()}
                {this.renderTweetText()}
                {tweet.entities.media &&
                    <img
                        className="img-fluid rounded"
                        src={tweet.entities.media[0].media_url_https}
                        alt="Attachement"
                    />
                }
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
