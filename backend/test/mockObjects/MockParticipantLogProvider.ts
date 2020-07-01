import {ParticipantLogProvider} from "../../src/database/ParticipantLogProvider";
import {IParticipantLog} from "../../src/common/logParticipantApi";

export class MockParticipantLogProvider extends ParticipantLogProvider {
    config = {
        storeLog: {
            throwError: false,
            storeLogIntention: null as null | IParticipantLog,
        }
    }
    constructor(...args: ConstructorParameters<typeof ParticipantLogProvider>) {
        super(...args);
    }

    storeLog = async (data: IParticipantLog): Promise<void> => {
        if (this.config.storeLog.throwError) {
            throw new Error("storeLog error");
        }
        this.config.storeLog.storeLogIntention = data;
    }
}
