import { AugmentedTweet } from "../../AugmentedTweet";

export class FlatTweetTreeBranch {
    constructor(
        public tweets: AugmentedTweet[] = []
    ) {}
    get rootId() {
        return this.tweets[0].id_str;
    }
}
export type FlatTweetTree = FlatTweetTreeBranch[];

class TweetTree {
    constructor(
        public tweet: AugmentedTweet,
        public children: TweetTree[] = []
    ) {}

    flatten(): FlatTweetTree {
        const result: FlatTweetTree = [];
        let temp: AugmentedTweet[] = [];
        (function dfs(currentTree: TweetTree) {
            temp.push(currentTree.tweet);
            if (currentTree.children.length === 0) {
                result.push(new FlatTweetTreeBranch(temp));
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
    public flattenedTweetTree: FlatTweetTree = [];
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
