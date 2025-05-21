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
const types_1 = require("../jobs/types");
const routes = (app, jobRepository) => {
    app
        .route("/jobs")
        .get((req, res, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
    }, (req, res) => {
        res.send("Get request succesful");
    })
        .post((req, res, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
    }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const data = req.body;
        if (typeof data != "object" || !data || Array.isArray(data)) {
            res
                .status(400)
                .send("Invalid request format. Expected a JSON object.");
            return;
        }
        if (!data.name ||
            typeof data.name != "string" ||
            data.name.trim() === "") {
            res
                .status(400)
                .send("Job 'name' is required and must be a non-empty string.");
            return;
        }
        let jobToSave;
        switch (data.type) {
            case types_1.TypeStatus.Email:
                if (!data.destination ||
                    !data.subject ||
                    typeof data.destination != "string" ||
                    typeof data.subject != "string") {
                    res
                        .status(400)
                        .send("Invalid Email job payload: destination and subject must be non-empty strings.");
                    return;
                }
                jobToSave = {
                    id: 0,
                    type: types_1.TypeStatus.Email,
                    name: data.name,
                    status: types_1.JobStatus.Pending,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    payload: {
                        destination: data.destination,
                        subject: data.subject,
                    },
                };
                yield jobRepository.add(jobToSave);
                res.status(201).json(jobToSave);
                break;
            case types_1.TypeStatus.ImageResize:
                if (!data.width ||
                    !data.height ||
                    !data.quality ||
                    typeof data.width != "number" ||
                    typeof data.height != "number" ||
                    typeof data.quality != "number") {
                    res
                        .status(400)
                        .send("Invalid Image Resize job payload: width, height must be positive numbers, quality 0-100.");
                    return;
                }
                jobToSave = {
                    id: 0,
                    type: types_1.TypeStatus.ImageResize,
                    name: data.name,
                    status: types_1.JobStatus.Pending,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    payload: {
                        width: data.width,
                        height: data.height,
                        quality: data.quality,
                    },
                };
                yield jobRepository.add(jobToSave);
                res.status(201).json(jobToSave);
                break;
            default:
                res.status(400).send("Unsupported job type specified.");
                return;
        }
    })) //finishing post
        .delete((req, res, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
    }, (req, res) => {
        res.send("Delete request succesful");
    });
    app
        .route("/jobs/:id")
        .get((req, res, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
    }, (req, res) => {
        res.send("Get request succesful");
    });
    app
        .route("/jobs/retry/:id")
        .patch((req, res, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
    }, (req, res) => {
        res.send("Status has been changed succesful");
    });
};
exports.default = routes;
