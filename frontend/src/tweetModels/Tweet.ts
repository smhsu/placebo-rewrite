import moment from "moment";
import { FullUser, Status } from "twitter-d";

const TIME_PARSE_STRING = "ddd MMM DD HH:mm:ss ZZ YYYY";

type PartialUser = Pick<FullUser, "name" | "screen_name" | "profile_image_url_https">

export enum MediaType {
    PHOTO,
    VIDEO
}

export class Tweet {
    static DEFAULT_PROFILE_PICTURE_URL =
        "https://abs.twimg.com/sticky/default_profile_images/default_profile_reasonably_small.png";
    static DEFAULT_USER: PartialUser = {
        name: "(Unknown user)",
        screen_name: "",
        profile_image_url_https: Tweet.DEFAULT_PROFILE_PICTURE_URL,
    };

    public createdAtUnix: number;
    public createdAtDescription: string;
    public retweeted_status: Tweet | null = null;
    public originalIndex: number;

    constructor(public raw: Status, index: number) {
        const parsed = moment(raw.created_at, TIME_PARSE_STRING);
        this.createdAtUnix = parsed.unix();
        this.createdAtDescription = parsed.fromNow();
        if (raw.retweeted_status) {
            this.retweeted_status = new Tweet(raw.retweeted_status, -1);
        }
        this.originalIndex = index;
    }

    static fromStatuses(statuses: Status[]) {
        return statuses.map((status, i) => new Tweet(status, i));
    }

    static sortNewestToOldest(tweets: Tweet[]) {
        return tweets.sort((tweet1, tweet2) => tweet2.createdAtUnix - tweet1.createdAtUnix);
    }

    get author() {
        const user = this.raw.user;
        return Object.prototype.hasOwnProperty.call(user, "name") ?
            (user as FullUser) : Tweet.DEFAULT_USER;
    }

    get isPureRetweet(): boolean {
        if (this.raw.retweeted_status) {
            let retweetText = (this.raw.full_text || "").trim();
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

    get id_str() {
        return this.raw.id_str;
    }

    get parent_id_str() {
        return this.raw.in_reply_to_status_id_str;
    }

    get favorite_count() {
        return this.raw.favorite_count;
    }

    get retweet_count() {
        return this.raw.retweet_count;
    }

    get text() {
        return this.raw.full_text || "";
    }

    get display_text_range() {
        return this.raw.display_text_range || [0, undefined];
    }

    findFirstMedia(): {type: MediaType, url: string} | null {
        const media = this.raw.extended_entities?.media || this.raw.entities.media;
        if (!media) {
            return null;
        }

        const firstMedia = media[0];
        if (!firstMedia || firstMedia.source_status_id_str) { // No first media or the media is from another status
            return null;
        }

        if (firstMedia.type === "video") {
            const firstVariant = firstMedia.video_info?.variants?.find(
                variant => variant.content_type.startsWith("video/")
            );
            return firstVariant ? {type: MediaType.VIDEO, url: firstVariant.url} : null;
        } else if (firstMedia.type === "photo") {
            return {type: MediaType.PHOTO, url: firstMedia.media_url_https};
        } else {
            return null;
        }
    }
}
