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
exports.InMemoryJobRepository = void 0;
const types_1 = require("./types");
let nextId = 1;
class InMemoryJobRepository {
    constructor() {
        this.jobs = new Map();
    }
    add(job) {
        return __awaiter(this, void 0, void 0, function* () {
            if (job.id == undefined || job.id == null || job.id == 0)
                job.id = nextId++;
            job.createdAt = new Date();
            job.updatedAt = new Date();
            job.status = types_1.JobStatus.Pending;
            this.jobs.set(job.id, job);
            console.log(`A new job was set properly with the id: ${job.id} , job's name: ${job.name}`);
            return Promise.resolve();
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const job = this.jobs.get(id);
            return Promise.resolve(job);
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const allJobs = Array.from(this.jobs.values());
            return Promise.resolve(allJobs);
        });
    }
    getPendingJobs() {
        return __awaiter(this, void 0, void 0, function* () {
            const allJobs = Array.from(this.jobs.values());
            const allPendingJobs = allJobs.filter((jobs) => {
                return jobs.status === types_1.JobStatus.Pending;
            });
            return allPendingJobs;
        });
    }
    update(id, updateFields) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingJob = this.jobs.get(id);
            if (!existingJob) {
                console.log(`the job with id: ${id} was not found for update`);
                return Promise.resolve();
            }
            const updatedJob = Object.assign(Object.assign(Object.assign({}, existingJob), updateFields), { updatedAt: new Date() });
            this.jobs.set(id, updatedJob);
            console.log(`Job updated: ${id} - Status: ${updatedJob.status}`);
            return Promise.resolve();
        });
    }
}
exports.InMemoryJobRepository = InMemoryJobRepository;
