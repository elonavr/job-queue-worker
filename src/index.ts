import express from "express";
import routes from "./api/routes";
import { InMemoryJobRepository } from "./jobs/inMemoryRepository";
import { EmailJobHandler } from "./handlers/emailHandler";
import { ImageResizeJobHandler } from "./handlers/imageResizeHandler";
import { TypeStatus } from "./jobs/types";
import { QueueWorker } from "./worker/worker";

const app = express();
const PORT = 3000;
const jobRepository = new InMemoryJobRepository();

app.use(express.json());
routes(app, jobRepository);

let handlerMap = {
  [TypeStatus.Email]: new EmailJobHandler(),
  [TypeStatus.ImageResize]: new ImageResizeJobHandler(),
};

let queueWorker = new QueueWorker(jobRepository, handlerMap);

queueWorker.startPolling(5000);

app.get("/", (req, res) => {
  res.send(`Node and Express are running in port ${PORT}`);
});

app.listen(3000, () => {
  console.log(`the server is running in port ${PORT} 😁`);
});
