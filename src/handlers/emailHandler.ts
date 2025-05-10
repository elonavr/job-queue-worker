import { JobHandler } from "./JobHandler";
import { EmailJob, TypeStatus } from "../jobs/types";

export class EmailJobHandler implements JobHandler<EmailJob> {
  async execute(job: EmailJob): Promise<void> {
    console.log(`Processing email job with ID: ${job.id}`);
    console.log(`Destination: ${job.destination}`);
    console.log(`Subject: ${job.subject}`);
    console.log(`Finished processing email job with ID: ${job.id}`);
  }
}
