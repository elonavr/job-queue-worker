import { JobRepository } from "../jobs/repository";
import { JobStatus, TypeStatus, Job } from "../jobs/types";
import { JobHandler } from "../handlers/JobHandler";

const MAX_JOB_ATTEMPTS = 3;

type HandlerMapType = {
  [key in TypeStatus]?: JobHandler<any>;
};

export class QueueWorker {
  private repository: JobRepository;
  private handlerMap: HandlerMapType;
  private pollingIntervalId?: NodeJS.Timeout;

  constructor(repo: JobRepository, handlersMap: HandlerMapType) {
    this.repository = repo;
    this.handlerMap = handlersMap;

    console.log("QueueWorker initialized with repository and handler map.");
  }

  private async processJob(job: Job) {
    try {
      await this.repository.update(job.id, { status: JobStatus.InProgress });
      console.log(
        `[Worker/ProcessJob] Successfully sent update for job ID ${job.id} to set status IN_PROGRESS.`
      );
      const specificHandler = this.handlerMap[job.type];
      if (specificHandler == undefined) {
        console.log(`This Job doesn't have any suitable handler`);
        throw new Error("No handler configured for job type");
      }
      await specificHandler?.execute(job);
      console.log(`The handler finished succesfully his job`);
    } catch (jobError) {
      console.error(
        `[Worker/ProcessJob] Handler for job ID ${job.id} (Type: ${job.type}) Failed during execution:`,
        jobError
      );
      throw jobError;
    }
  }

  private async pollForJobs() {
    try {
      const pendingJobs = await this.repository.getPendingJobs();
      if (pendingJobs && pendingJobs.length > 0) {
        console.log(
          `the number of jobs that recived are: ${pendingJobs.length}`
        );
        for (const job of pendingJobs) {
          try {
            await this.processJob(job);
            try {
              await this.repository.update(job.id, {
                status: JobStatus.Done,
                attempts: job.attempts,
              });
            } catch (updateError) {
              console.error(
                `[Worker] Failed to update job ID ${job.id} status to DONE:`,
                updateError
              );
            }
          } catch (jobError) {
            console.error(
              `[Worker] Error processing job ID ${job.id} (current attempts: ${job.attempts}):`,
              jobError
            );
            const currentAttempts = job.attempts || 0;
            if (currentAttempts < MAX_JOB_ATTEMPTS) {
              console.log(
                `[Worker] Retrying job ID ${
                  job.id
                }. Incrementing attempt count to ${currentAttempts + 1}.`
              );
              try {
                await this.repository.update(job.id, {
                  attempts: currentAttempts + 1,
                  status: JobStatus.Pending,
                });
              } catch (updateError) {
                console.error(
                  `[Worker] Failed to update attempts for job ID ${job.id} during retry logic:`,
                  updateError
                );
              }
            } else {
              console.log(
                `[Worker] Job ID ${job.id} failed after ${
                  currentAttempts + 1
                } attempts. Marking as FAILED.`
              );
              try {
                await this.repository.update(job.id, {
                  status: JobStatus.Failed,
                  attempts: currentAttempts + 1,
                });
              } catch (finalUpdateError) {
                console.error(
                  `[Worker] Failed to update job ID ${job.id} status to FAILED:`,
                  finalUpdateError
                );
              }
            }
          }
        }
      } else {
        console.log("No Jobs to process");
      }
    } catch (error) {
      console.error(`Polling jobs faild:`, error);
    }
  }

  public startPolling(intervalTime: number) {
    console.log(`QueueWorker starting polling every ${intervalTime}ms.`);
    this.pollingIntervalId = setInterval(() => {
      this.pollForJobs().catch((error) => {
        console.error("Error during worker pulling interval:", error);
      });
    }, intervalTime);
  }
}
