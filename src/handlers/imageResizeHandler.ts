import { JobHandler } from "./JobHandler";
import { ImageResizeJob, TypeStatus } from "../jobs/types";

export class ImageResizeJobHandler implements JobHandler<ImageResizeJob> {
  async execute(job: ImageResizeJob): Promise<void> {
    console.log(`Job ID: ${job.id}`);
    console.log(`Job Type: ${job.type}`);
    console.log(`Target Width: ${job.width}`);
    console.log(`Target Height: ${job.height}`);
    console.log(`Image Quality: ${job.quality}`);
  }
}
