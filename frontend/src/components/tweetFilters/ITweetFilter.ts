import { AugmentedTweet } from "../../AugmentedTweet";

export const TWEETS_COLLAPSE_THRESHOLD = 3;
export type TweetTreeBranch = AugmentedTweet[];

class TweetTree {
    constructor(
        public tweet: AugmentedTweet,
        public children: TweetTree[] = []
    ) {}

    flatten(): TweetTreeBranch[] {
        const result: TweetTreeBranch[] = [];
        let temp: AugmentedTweet[] = [];
        (function dfs(currentTree: TweetTree) {
            temp.push(currentTree.tweet);
            if (currentTree.children.length === 0) {
                result.push(temp);
                temp = [];
            } else {
                for (const child of currentTree.children) {
                    dfs(child);
                }
            }
        })(this);
        return result;
    }

    static fromTweets(tweets: AugmentedTweet[]): TweetTree[] {
        const rootNodes = [];
        const treeNodeForId = new Map<string, TweetTree>();
        for (const tweet of tweets) {
            const thread = new TweetTree(tweet);
            treeNodeForId.set(tweet.id_str, thread);
        }

        for (const node of treeNodeForId.values()) {
            const parentTweetId = node.tweet.in_reply_to_status_id_str || "";
            const parentNode = treeNodeForId.get(parentTweetId);
            if (parentNode) {
                parentNode.children.push(node);
            } else {
                rootNodes.push(node); // Has no parent?  Then you must be top-level.
            }
        }
        return rootNodes;
    }
}

export class RequestedRenderConfig {
    public flattenedTweetTree: TweetTreeBranch[] = [];
    constructor(
        tweets: AugmentedTweet[] = [],
        public shouldAnimate = false
    ) {
        for (const tree of TweetTree.fromTweets(tweets)) {
            this.flattenedTweetTree.push(...tree.flatten());
        }
    }
}

export interface ITweetFilter {
    data: AugmentedTweet[];
    onUpdate(data: RequestedRenderConfig): void;
}
