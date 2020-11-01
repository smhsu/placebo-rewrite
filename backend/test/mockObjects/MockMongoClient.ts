import {Collection, Db, MongoClient, Server} from "mongodb";

export class MockMongoClient extends MongoClient {
    private _testDb: Db;
    private _mockCollection: Partial<Collection>; 

    constructor() {
        super("", undefined);
        this._testDb = new Db("test", new Server("localhost", 0));
        this._mockCollection = {};
        this._testDb.collection = () => this._mockCollection as Collection;
    }
    
    db(): Db {
        return this._testDb;
    }

    /**
     * Dynamically modifies whatever collection object has been retrieved from this instance, such that the collection's
     * methods can be configured or stubbed to do whatever.  Accepts an object whose methods will be merged into the
     * collection object.
     * 
     * @param collection - methods to merge into this instance's collection object
     */
    modifyCollection(collection: Partial<Collection>): void {
        Object.assign(this._mockCollection, collection);
    }
}
