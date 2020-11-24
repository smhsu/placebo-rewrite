import seedrandom from "seedrandom";

export class RandomNumberGenerator {
    private _rng: seedrandom.prng;

    constructor(private _seed="0") {
        this._rng = seedrandom(_seed);
    }

    reset(): void {
        this._rng = seedrandom(this._seed);
    }

    nextFloat(): number {
        return this._rng.quick();
    }

    nextInt(): number {
        return this._rng.int32();
    }
}
