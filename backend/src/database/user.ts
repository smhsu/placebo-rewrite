import {Collection, MongoClient} from "mongodb";
import * as RandomAssignment from "../../../common/src/requestRandomAssignmentApi";

export const userConnection = {
    getCollection(client: MongoClient) {
        return client.db(process.env.DATABASE_NAME).collection(process.env.USER_COLLECTION_NAME)
    },
    async getCounts(collection: Collection, groupFieldName = 'group') {
        const total = await collection.countDocuments();
        const controlGroup = await collection
            .find({[groupFieldName]: RandomAssignment.GroupAssigment.CONTROL})
            .count();
        return {total, controlGroup};
    }
};
