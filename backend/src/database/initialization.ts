import { MongoClient } from "mongodb";

export function getClient(): Promise<MongoClient> {
    return MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}
