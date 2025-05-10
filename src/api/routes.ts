import { Application, Request, Response } from "express";
import { JobRepository } from "../jobs/repository";
import { JobStatus, TypeStatus, Job } from "../jobs/types";

const routes = (app: Application, jobRepository: JobRepository) => {
  app
    .route("/jobs")

    .get(
      (req: Request, res: Response, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
      },
      (req: Request, res: Response) => {
        res.send("Get request succesful");
      }
    )

    .post(
      (req: Request, res: Response, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
      },
      async (req: Request, res: Response) => {
        const data = req.body;
        if (typeof data != "object" || !data || Array.isArray(data)) {
          res
            .status(400)
            .send("Invalid request format. Expected a JSON object.");
          return;
        }

        if (
          !data.name ||
          typeof data.name != "string" ||
          data.name.trim() === ""
        ) {
          res
            .status(400)
            .send("Job 'name' is required and must be a non-empty string.");
          return;
        }

        let jobToSave: Job;

        switch (data.type) {
          case TypeStatus.Email:
            if (
              !data.destination ||
              !data.subject ||
              typeof data.destination != "string" ||
              typeof data.subject != "string"
            ) {
              res
                .status(400)
                .send(
                  "Invalid Email job payload: destination and subject must be non-empty strings."
                );
              return;
            }

            jobToSave = {
              type: TypeStatus.Email,
              name: data.name,
              destination: data.destination,
              subject: data.subject,
            } as Job;

            await jobRepository.add(jobToSave);
            res.status(201).json(jobToSave);

            break;

          case TypeStatus.ImageResize:
            if (
              !data.width ||
              !data.height ||
              !data.quality ||
              typeof data.width != "number" ||
              typeof data.height != "number" ||
              typeof data.quality != "number"
            ) {
              res
                .status(400)
                .send(
                  "Invalid Image Resize job payload: width, height must be positive numbers, quality 0-100."
                );
              return;
            }
            jobToSave = {
              type: TypeStatus.ImageResize,
              name: data.name,
              width: data.width,
              height: data.height,
              quality: data.quality,
            } as Job;

            await jobRepository.add(jobToSave);
            res.status(201).json(jobToSave);
            break;

          default:
            res.status(400).send("Unsupported job type specified.");
            return;
        }
      }
    ) //finishing post
    .delete(
      (req: Request, res: Response, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
      },
      (req: Request, res: Response) => {
        res.send("Delete request succesful");
      }
    );
  app
    .route("/jobs/:id")

    .get(
      (req: Request, res: Response, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
      },

      (req: Request, res: Response) => {
        res.send("Get request succesful");
      }
    );

  app
    .route("/jobs/retry/:id")

    .patch(
      (req: Request, res: Response, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
      },
      (req: Request, res: Response) => {
        res.send("Status has been changed succesful");
      }
    );
};
export default routes;
