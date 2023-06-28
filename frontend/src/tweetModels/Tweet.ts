import { DateTime } from "luxon";
import { ApiV2Includes, TweetEntityUrlV2, TweetV2, TwitterV2IncludesHelper } from "twitter-api-v2";

interface UserInfo {
    name: string;
    screen_name: string;
    profile_image_url_https: string;
}

export enum MediaType {
    PHOTO,
    VIDEO
}

export class Tweet {
    static DEFAULT_PROFILE_PICTURE_URL =
        "https://abs.twimg.com/sticky/default_profile_images/default_profile_reasonably_small.png";
    static DEFAULT_USER: UserInfo = {
        name: "(Unknown user)",
        screen_name: "",
        profile_image_url_https: Tweet.DEFAULT_PROFILE_PICTURE_URL,
    };

    public createdAtUnix: number;
    public createdAtDescription: string;
    /** Retweeted OR quoted tweet */
    public retweeted_status: Tweet | null = null;
    public originalIndex: number;
    private _includes: TwitterV2IncludesHelper;

    constructor(public raw: TweetV2, includes: TwitterV2IncludesHelper, index: number) {
        this._includes = includes;
        if (raw.created_at) {
            const parsed = DateTime.fromISO(raw.created_at);
            this.createdAtUnix = parsed.toUnixInteger();
            this.createdAtDescription = parsed.toRelative() || "";
        } else {
            this.createdAtUnix = 0;
            this.createdAtDescription = "";
        }

        const retweet = includes.retweet(raw) || includes.quote(raw);
        if (retweet) {
            this.retweeted_status = new Tweet(retweet, includes, -1);
        }

        this.originalIndex = index;
    }

    static fromApiData(twitterApiResult: { data: TweetV2[], includes: ApiV2Includes }) {
        const includes = new TwitterV2IncludesHelper(twitterApiResult);
        return twitterApiResult.data.map((status, i) => new Tweet(status, includes, i));
    }

    static sortNewestToOldest(tweets: Tweet[]) {
        return tweets.sort((tweet1, tweet2) => tweet2.createdAtUnix - tweet1.createdAtUnix);
    }

    get author(): UserInfo {
        const user = this._includes.userById(this.raw.author_id || "")
        if (!user) {
            return Tweet.DEFAULT_USER;
        }

        return {
            name: user.name,
            screen_name: user.username,
            profile_image_url_https: user.profile_image_url || ""
        }
    }

    get urlEntities(): TweetEntityUrlV2[] {
        return this.raw.entities?.urls || [];
    }

    get isPureRetweet(): boolean {
        if (this.retweeted_status) {
            let processedText = (this.text).trim();
            if (processedText.length <= 0) {
                return true
            }

            if (processedText.endsWith("…")) { // Remove the "..."
                processedText = processedText.substring(0, processedText.length - 1);
            }
            // Delete any "RT @someTwitterUser:" that might appear at the start
            processedText = processedText.replace(/^RT @\w+:/, "").trim();

            // Whether the tweet's text is entirely contained in the retweeted status's text
            return this.retweeted_status.text.indexOf(processedText) >= 0;
        }

        return false;
    }

    get id_str(): string {
        return this.raw.id;
    }

    get parent_id_str(): string {
        return this._includes.repliedTo(this.raw)?.id || "";
    }

    get favorite_count(): number {
        return this.raw.public_metrics?.like_count || 0;
    }

    get retweet_count(): number {
        return this.raw.public_metrics?.retweet_count || 0;
    }

    get text(): string {
        return this.raw.text;
    }

    findFirstMedia(): { type: MediaType, url: string } | null {
        const medias = this._includes.medias(this.raw);
        const firstMedia = medias[0];
        if (!firstMedia || !firstMedia.url) {
            return null;
        }

        if (firstMedia.type === "video") {
            return { type: MediaType.VIDEO, url: firstMedia.url };
        } else if (firstMedia.type === "photo") {
            return { type: MediaType.PHOTO, url: firstMedia.url };
        }

        return null;
    }
}
