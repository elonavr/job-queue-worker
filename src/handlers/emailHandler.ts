import { JobHandler } from "./JobHandler";
import { EmailJob, TypeStatus } from "../jobs/types";

export class EmailJobHandler implements JobHandler<EmailJob> {
  async execute(job: EmailJob): Promise<void> {
    console.log(`Processing email job with ID: ${job.id}`);
    console.log(`Destination: ${job.payload.destination}`);
    console.log(`Subject: ${job.payload.subject}`);
    console.log(`Finished processing email job with ID: ${job.id}`);
  }
}
