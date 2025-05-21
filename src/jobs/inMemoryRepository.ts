/*
import { Job, JobStatus } from "./types";
import { JobRepository } from "./repository";

let nextId = 1;

export class InMemoryJobRepository implements JobRepository {
  private jobs = new Map<number, Job>();

    async add(job: Job): Promise<void> {
      if (job.id == undefined || job.id == null || job.id == 0) job.id = nextId++;
      job.createdAt = new Date();
      job.updatedAt = new Date();
      job.status = JobStatus.Pending;

      this.jobs.set(job.id, job);
      console.log(
        `A new job was set properly with the id: ${job.id} , job's name: ${job.name}`
      );
      return Promise.resolve();
    }

    async get(id: number): Promise<Job | undefined> {
      const job = this.jobs.get(id);
      return Promise.resolve(job);
    }

    async list(): Promise<Job[]> {
      const allJobs = Array.from(this.jobs.values());
      return Promise.resolve(allJobs);
    }

    async getPendingJobs(): Promise<Job[]> {
      const allJobs = Array.from(this.jobs.values());
      const allPendingJobs = allJobs.filter((jobs) => {
        return jobs.status === JobStatus.Pending;
      });
      return allPendingJobs;
    }

    async update(id: number, updateFields: Partial<Job>): Promise<void> {
      const existingJob = this.jobs.get(id);

      if (!existingJob) {
        console.log(`the job with id: ${id} was not found for update`);
        return Promise.resolve();
      }
      const updatedJob: Job = {
        ...existingJob,
        ...updateFields,
        updatedAt: new Date(),
      } as Job;

      this.jobs.set(id, updatedJob);
      console.log(`Job updated: ${id} - Status: ${updatedJob.status}`);
      return Promise.resolve();
    }
}
*/
