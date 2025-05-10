"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueWorker = void 0;
const types_1 = require("../jobs/types");
class QueueWorker {
    constructor(repo, handlersMap) {
        this.repository = repo;
        this.handlerMap = handlersMap;
        console.log("QueueWorker initialized with repository and handler map.");
    }
    processJob(job) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.repository.update(job.id, { status: types_1.JobStatus.InProgress });
                const specificHandler = this.handlerMap[job.type];
                if (specificHandler == undefined) {
                    console.log(`This Job doesn't have any suitable handler`);
                    yield this.repository.update(job.id, { status: types_1.JobStatus.Failed });
                    return;
                }
                yield (specificHandler === null || specificHandler === void 0 ? void 0 : specificHandler.execute(job));
                yield this.repository.update(job.id, { status: types_1.JobStatus.Done });
            }
            catch (jobError) {
                console.error("error occured", jobError);
                yield this.repository.update(job.id, { status: types_1.JobStatus.Failed });
            }
        });
    }
    pollForJobs() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pendingJobs = yield this.repository.getPendingJobs();
                if (pendingJobs && pendingJobs.length > 0) {
                    console.log(`the number of jobs that recived are: ${pendingJobs.length}`);
                    for (const job of pendingJobs) {
                        try {
                            yield this.processJob(job);
                        }
                        catch (jobError) {
                            console.error("error occured", jobError);
                        }
                    }
                }
                else {
                    console.log("No Jobs to process");
                }
            }
            catch (error) {
                console.error("Polling jobs faild:", error);
            }
        });
    }
    startPolling(intervalTime) {
        console.log(`QueueWorker starting polling every ${intervalTime}ms.`);
        this.pollingIntervalId = setInterval(() => {
            this.pollForJobs().catch((error) => {
                console.error("Error during worker pulling interval:", error);
            });
        }, intervalTime);
    }
}
exports.QueueWorker = QueueWorker;
