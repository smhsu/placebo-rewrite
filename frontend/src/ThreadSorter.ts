import { TweetThread } from "./TweetThread";
import { RandomNumberGenerator } from "./RandomNumberGenerator";

export interface IThreadSorter {
    sort(threads: TweetThread[]): TweetThread[];
}

export class OriginalOrderSorter implements IThreadSorter {
    sort(threads: TweetThread[]): TweetThread[] {
        return threads.sort((a, b) => a[0].originalIndex - b[0].originalIndex);
    }
}

export class ThreadShuffler implements IThreadSorter {
    sort(threads: TweetThread[]): TweetThread[] {
        return threads.sort((a, b) => {
            // Seed the RNGs with the id_str so the sort is consistent
            const rngA = new RandomNumberGenerator(a[0].id_str);
            const rngB = new RandomNumberGenerator(b[0].id_str);
            return rngA.nextInt() - rngB.nextInt();
        });
    }
}
