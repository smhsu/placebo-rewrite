// TODO: remove this file

export const guardEnv = {
    databaseSetup() {
        if (!process.env.MONGODB_URI) {
            throw new Error('Mongodb URI must be specified in the environment variable')
        }
    },
    databaseConnection() {
        if (!(process.env.USER_COLLECTION_NAME && process.env.DATABASE_NAME)) {
            throw new Error('USER_COLLECTION_NAME and DATABASE_NAME must be specified in the environment variable');
        }
    },
    groupPercentage() {
        const rawControlPercentage = process.env.CONTROL_GROUP_PERCENTAGE;
        if (rawControlPercentage != null) {
            const result = parseFloat(rawControlPercentage);
            if (Number.isNaN(result)) {
                throw new Error('Must input valid numeric number for CONTROL_GROUP_PERCENTAGE in the environment variable');
            }
            if (result < 0 || result > 1) {
                throw new Error('CONTROL_GROUP_PERCENTAGE must within the range [0, 1] in the environment variable');
            }
        }
    }
};
