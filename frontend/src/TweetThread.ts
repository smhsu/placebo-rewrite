import { Tweet } from "./Tweet";

export type TweetThread = Tweet[];

export function organizeIntoThreads(tweets: Tweet[]): TweetThread[] {
    return makeTrees(tweets).map(flattenTreeIntoThreads).flat(1);
}

interface TweetTreeNode {
    tweet: Tweet;
    children: TweetTreeNode[];
}

function makeTrees(tweets: Tweet[]): TweetTreeNode[] {
    const rootNodes = [];
    const treeNodeForId = new Map<string, TweetTreeNode>();
    for (const tweet of tweets) {
        const thread = {tweet, children: []};
        treeNodeForId.set(tweet.id_str, thread);
    }

    for (const node of treeNodeForId.values()) {
        const parentTweetId = node.tweet.parent_id_str || "";
        const parentNode = treeNodeForId.get(parentTweetId);
        if (parentNode) {
            parentNode.children.push(node);
        } else {
            rootNodes.push(node); // Has no parent?  Then you must be top-level.
        }
    }
    return rootNodes;
}

function flattenTreeIntoThreads(root: TweetTreeNode): TweetThread[] {
    const branches: TweetThread[] = [];
    let currentBranch: Tweet[] = [];
    function dfs(tree: TweetTreeNode) {
        currentBranch.push(tree.tweet);
        if (tree.children.length === 0) { // Leaf: end of branch.
            branches.push(currentBranch);
            currentBranch = [];
        } else {
            for (const child of tree.children) {
                dfs(child);
            }
        }
    }
    dfs(root);
    return branches;
}
