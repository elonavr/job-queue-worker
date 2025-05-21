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
      async (req: Request, res: Response) => {
        try {
          const allJobs = await jobRepository.list();
          res.status(200).json(allJobs);
        } catch (error) {
          console.error("[API] GET /jobs - Error fetching jobs:", error);
          if (!res.headersSent) {
            res.status(500).send("Failed to fetch jobs."); // שלב 4
          }
        }
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
      async (req: Request, res: Response) => {
        const stringId = req.params.id;
        const numberId = parseInt(stringId, 10);

        if (isNaN(numberId)) {
          console.error(`[API] GET /jobs/:id - Invalid ID format: ${stringId}`);
          if (!res.headersSent) {
            res.status(400).send("Invalid ID format. ID must be a number.");
          }
          return;
        }
        console.log(
          `[API] GET /jobs/:id - Valid numeric ID received: ${numberId}. Attempting to fetch job.`
        );
        try {
          const job = await jobRepository.get(numberId);

          if (job) {
            res.status(200).json(job);
            console.log(
              `[API] GET /jobs/:id - Job ID ${numberId} found. Responding to client:`,
              JSON.stringify(job, null, 2)
            );
            if (!res.headersSent) {
              res.status(200).json(job);
            }
          } else {
            console.log(`[API] GET /jobs/:id - Job ID ${numberId} not found.`);
            if (!res.headersSent) {
              res.status(404).send(`Job with id ${numberId} not found.`);
            }
          }
        } catch (error) {
          console.error(
            `[API] GET /jobs/:id - Error fetching job ID ${numberId}:`,
            error
          );
          if (!res.headersSent) {
            res.status(500).send(`Failed to fetch job with id ${numberId}.`);
          }
        }
      }
    )

    .post(
      (req: Request, res: Response, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
      },
      async (req: Request, res: Response) => {
        console.log(
          "[API] Received POST /jobs request. Body:",
          JSON.stringify(req.body, null, 2)
        );
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

        if (
          !data.type ||
          typeof data.type !== "string" ||
          !Object.values(TypeStatus).includes(data.type as TypeStatus)
        ) {
          res
            .status(400)
            .send(
              `Invalid job type specified. Must be one of: ${Object.values(
                TypeStatus
              ).join(", ")}`
            );
          return;
        }

        console.log(
          `[API] Input validation passed for job: ${data.name}, type: ${data.type}`
        );
        let jobToSave: Job;

        switch (data.type as TypeStatus) {
          case TypeStatus.Email:
            if (
              !data.payload ||
              typeof data.payload !== "object" ||
              !data.payload.destination ||
              !data.payload.subject ||
              typeof data.payload.destination != "string" ||
              typeof data.payload.subject != "string"
            ) {
              res
                .status(400)
                .send(
                  "Invalid Email job payload: destination and subject must be non-empty strings."
                );
              return;
            }

            jobToSave = {
              id: 0,
              type: TypeStatus.Email,
              name: data.name,
              status: JobStatus.Pending,
              createdAt: new Date(),
              updatedAt: new Date(),
              attempts: 0,
              payload: {
                destination: data.payload.destination,
                subject: data.payload.subject,
                ...(data.payload.body && { body: data.payload.body }),
              },
            } as Job;
            console.log(
              `[API] Calling jobRepository.add with app job:`,
              JSON.stringify(jobToSave, null, 2)
            );

            try {
              await jobRepository.add(jobToSave);
              console.log(
                `[API] Job added successfully via repository. Responding to client.`
              );
              res.status(201).json(jobToSave);
            } catch (error) {
              console.error("Error adding email job:", error);
              res.status(500).send("Failed to add email job.");
            }

            break;

          case TypeStatus.ImageResize:
            if (
              !data.payload ||
              typeof data.payload !== "object" ||
              !data.payload.sourceUrl ||
              typeof data.payload.sourceUrl !== "string" ||
              !data.payload.width ||
              typeof data.payload.width != "number" ||
              data.payload.width <= 0 ||
              !data.payload.height ||
              typeof data.payload.height != "number" ||
              data.payload.height <= 0 ||
              !data.payload.quality ||
              typeof data.payload.quality != "number" ||
              data.payload.quality < 0 ||
              data.payload.quality > 100
            ) {
              res
                .status(400)
                .send(
                  "Invalid Image Resize job payload: width, height must be positive numbers, quality 0-100."
                );
              return;
            }
            jobToSave = {
              id: 0,
              type: TypeStatus.ImageResize,
              name: data.name,
              status: JobStatus.Pending,
              createdAt: new Date(),
              updatedAt: new Date(),
              attempts: 0,
              payload: {
                sourceUrl: data.payload.sourceUrl,
                width: data.payload.width,
                height: data.payload.height,
                quality: data.payload.quality,
                ...(data.payload.targetFormat &&
                  typeof data.payload.targetFormat === "string" && {
                    targetFormat: data.payload.targetFormat as "jpeg" | "png",
                  }),
              },
            } as Job;

            console.log(
              `[API] Calling jobRepository.add with app job:`,
              JSON.stringify(jobToSave, null, 2)
            );

            try {
              await jobRepository.add(jobToSave);
              console.log(
                `[API] Job added successfully via repository. Responding to client.`
              );
              res.status(201).json(jobToSave);
            } catch (error) {
              console.error("Error adding image resize job:", error);
              res.status(500).send("Failed to add image resize job.");
            }

            break;

          default:
            res
              .status(400)
              .send(`Unsupported job type specified: ${data.type}`);
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
    .route("/jobs/retry/:id")

    .patch(
      (req: Request, res: Response, next) => {
        console.log(`Request from ${req.originalUrl} `);
        console.log(`Request from ${req.method}`);
        next();
      },
      async (req: Request, res: Response) => {
        const stringId = req.params.id;
        const numberId = parseInt(stringId, 10);

        if (isNaN(numberId)) {
          console.error(`[API] GET /jobs/:id - Invalid ID format: ${stringId}`);
          if (!res.headersSent) {
            res.status(400).send("Invalid ID format. ID must be a number.");
          }
          return;
        }

        console.log(
          `[API] PATCH /jobs/:id - Valid numeric ID received: ${numberId}. Attempting to fetch job.`
        );
        try {
          const job = await jobRepository.get(numberId);
          if (!job) {
            res.status(404).send(`The job with id ${numberId} was not found`);
            return;
          }
          if (job.status === "FAILED") {
            console.log(
              `[API] PATCH /jobs/retry/:id - Job ID ${numberId} is FAILED. Attempting to reset for retry.`
            );
            try {
              await jobRepository.update(numberId, {
                status: JobStatus.Pending,
                attempts: 0,
              });
              const updatedJobForResponse = await jobRepository.get(numberId);
              console.log(
                `[API] PATCH /jobs/retry/:id - Job ID ${numberId} successfully reset for retry. New status: PENDING, Attempts: 0.`
              );
              if (!res.headersSent) {
                res.status(200).json(updatedJobForResponse || job);
              }
            } catch (updateError) {
              console.error(
                `[API] PATCH /jobs/retry/:id - Error updating job ID ${numberId} for retry:`,
                updateError
              );
              res
                .status(500)
                .send(`Error updating job with id:${numberId} for retry`);
            }
          } else {
            console.log(
              `[API] PATCH /jobs/retry/:id - Job ID ${numberId} is not in FAILED status (current status: ${job.status}). No retry action taken.`
            );
            if (!res.headersSent) {
              res
                .status(400)
                .send(
                  `Job with id ${numberId} is not in FAILED status. Current status: ${job.status}.`
                );
            }
          }
        } catch (fetchError) {
          console.error(
            `[API] PATCH /jobs/retry/:id - Error fetching job ID ${numberId} for retry:`,
            fetchError
          );
          if (!res.headersSent) {
            res
              .status(500)
              .send(`Failed to process retry for job with id ${numberId}.`);
          }
        }
      }
    );
};
export default routes;
