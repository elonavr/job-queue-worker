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
exports.PrismaJobRepository = void 0;
const client_1 = require("@prisma/client");
const types_1 = require("./types");
class PrismaJobRepository {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    add(job) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.job.create({
                data: {
                    type: job.type,
                    name: job.name,
                    status: job.status,
                    payload: job.payload,
                },
            });
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const job = yield this.prisma.job.findUnique({
                where: { id: id },
            });
            if (!job) {
                return undefined;
            }
            return job;
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.job.findMany();
        });
    }
    getPendingJobs() {
        return __awaiter(this, void 0, void 0, function* () {
            const pendingJobs = yield this.prisma.job.findMany({
                where: {
                    status: types_1.JobStatus.Pending,
                },
            });
            return pendingJobs;
        });
    }
    update(id, updateFields) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.job.update({
                    where: { id: id },
                    data: updateFields,
                });
            }
            catch (error) {
                if (error &&
                    typeof error === "object" &&
                    "code" in error &&
                    error.code === "P2025") {
                    console.log(`Error: Job with id ${id} not found for update.`);
                    return;
                }
                throw error;
            }
        });
    }
}
exports.PrismaJobRepository = PrismaJobRepository;
