"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./api/routes"));
const prismaRepository_1 = require("./jobs/prismaRepository");
const emailHandler_1 = require("./handlers/emailHandler");
const imageResizeHandler_1 = require("./handlers/imageResizeHandler");
const types_1 = require("./jobs/types");
const worker_1 = require("./worker/worker");
const app = (0, express_1.default)();
const PORT = 3000;
const jobRepository = new prismaRepository_1.PrismaJobRepository();
app.use(express_1.default.json());
(0, routes_1.default)(app, jobRepository);
let handlerMap = {
    [types_1.TypeStatus.Email]: new emailHandler_1.EmailJobHandler(),
    [types_1.TypeStatus.ImageResize]: new imageResizeHandler_1.ImageResizeJobHandler(),
};
let queueWorker = new worker_1.QueueWorker(jobRepository, handlerMap);
queueWorker.startPolling(5000);
app.get("/", (req, res) => {
    res.send(`Node and Express are running in port ${PORT}`);
});
app.listen(3000, () => {
    console.log(`the server is running in port ${PORT} 😁`);
});
