import { JobRepository } from "../jobs/repository";
import { JobStatus, TypeStatus, Job } from "../jobs/types";
import { JobHandler } from "../handlers/JobHandler";

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
      const specificHandler = this.handlerMap[job.type];
      if (specificHandler == undefined) {
        console.log(`This Job doesn't have any suitable handler`);
        await this.repository.update(job.id, { status: JobStatus.Failed });
        return;
      }
      await specificHandler?.execute(job);
      await this.repository.update(job.id, { status: JobStatus.Done });
    } catch (jobError) {
      console.error("error occured", jobError);
      await this.repository.update(job.id, { status: JobStatus.Failed });
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
          } catch (jobError) {
            console.error("error occured", jobError);
          }
        }
      } else {
        console.log("No Jobs to process");
      }
    } catch (error) {
      console.error("Polling jobs faild:", error);
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
