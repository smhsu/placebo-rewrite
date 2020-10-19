import { FullUser, Status, User } from "twitter-d";

function isFullUser(user: User): user is FullUser {
    return Object.prototype.hasOwnProperty.call(user, 'name');
}

export function getTweetAuthor<T>(tweet: Status, fallbackValue: T): FullUser | T {
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
