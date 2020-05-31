import {MongoClient} from "mongodb";

export async function getClient(): Promise<MongoClient> {
    return await MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}
