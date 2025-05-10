import { Job } from "../jobs/types";

export interface JobHandler<T extends Job> {
  execute(job: T): Promise<void>;
}
