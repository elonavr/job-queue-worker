import { Job, JobStatus } from "./types";

export interface JobRepository {
  add(job: Job): Promise<void>;

  get(id: number): Promise<Job | undefined>;

  list(): Promise<Job[]>;

  getPendingJobs(): Promise<Job[]>;

  update(id: number, updateFields: Partial<Job>): Promise<void>;
}
