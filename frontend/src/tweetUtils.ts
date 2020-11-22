import { FullUser, Status, User } from "twitter-d";

export const DEFAULT_PROFILE_PICTURE_URL =
    "https://abs.twimg.com/sticky/default_profile_images/default_profile_reasonably_small.png";

type PartialUser = Pick<FullUser, "name" | "screen_name" | "profile_image_url_https">
const UNKNOWN_USER: PartialUser = {
    name: "(Unknown user)",
    screen_name: "",
    profile_image_url_https: DEFAULT_PROFILE_PICTURE_URL,
};

function isFullUser(user: User): user is FullUser {
    return Object.prototype.hasOwnProperty.call(user, "name");
}

export function getTweetAuthor(tweet: Status, fallbackValue = UNKNOWN_USER): PartialUser {
    const user = tweet.user;
    return isFullUser(user) ? user : fallbackValue;
}

export function isPureRetweet(tweet: Status): boolean {
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
        return retweetText.indexOf(retweetText) >= 0; 
    }

    return false;
}
