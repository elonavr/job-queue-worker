import { JobRepository } from "./repository";
import { Job, JobStatus, TypeStatus, EmailJob, ImageResizeJob } from "./types";
import {
  PrismaClient,
  Job as PrismaJobModel,
  JobStatus as PrismaGeneratedJobStatusEnum,
  $Enums,
  JobTypeEnum,
} from "../generated/prisma";
import {
  JsonValue,
  NeverToUnknown,
  skip,
} from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import { create } from "domain";
import { error } from "console";
import { json } from "stream/consumers";

type PrismaJobPayload = {
  id: number;
  name: string;
  type: string;
  status: string;
  payload: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
  attempts: number;
};

export class PrismaJobRepository implements JobRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private mapPrismaJobToAppJob(
    prismaJob: PrismaJobPayload | undefined
  ): Job | undefined {
    if (!prismaJob) return undefined;

    let mappedAppType: TypeStatus;
    if (prismaJob.type === "EMAIL") {
      mappedAppType = TypeStatus.Email;
    } else if (prismaJob.type === "IMAGE_RESIZE") {
      mappedAppType = TypeStatus.ImageResize;
    } else {
      console.error(`Unknown job type from Prisma: ${prismaJob.type}`);
      return undefined;
    }
    let mappedAppStatus: JobStatus;
    if (prismaJob.status === "PENDING") {
      mappedAppStatus = JobStatus.Pending;
    } else if (prismaJob.status === "IN_PROGRESS") {
      mappedAppStatus = JobStatus.InProgress;
    } else if (prismaJob.status === "DONE") {
      mappedAppStatus = JobStatus.Done;
    } else if (prismaJob.status === "FAILED") {
      mappedAppStatus = JobStatus.Failed;
    } else {
      throw new Error(`Unknown job status from Prisma: ${prismaJob.status}`);
    }

    let finalPayload:
      | { destination: string; subject: string; body?: string | undefined }
      | {
          sourceUrl: string;
          width: number;
          height: number;
          quality: number;
          targetFormat?: "jpeg" | "png" | undefined;
        };

    if (mappedAppType === TypeStatus.Email) {
      if (
        prismaJob.payload &&
        typeof prismaJob.payload === "object" &&
        "destination" in prismaJob.payload &&
        typeof (prismaJob.payload as any).destination === "string" &&
        "subject" in prismaJob.payload &&
        typeof (prismaJob.payload as any).subject === "string"
      ) {
        finalPayload = prismaJob.payload as {
          destination: string;
          subject: string;
          body?: string | undefined;
        };
      } else {
        throw new Error("Invalid or missing payload structure for Email job");
      }
    } else if (mappedAppType === TypeStatus.ImageResize) {
      if (
        prismaJob.payload &&
        typeof prismaJob.payload === "object" &&
        "sourceUrl" in prismaJob.payload &&
        typeof (prismaJob.payload as any).sourceUrl === "string" &&
        "width" in prismaJob.payload &&
        typeof (prismaJob.payload as any).width === "number" &&
        "height" in prismaJob.payload &&
        typeof (prismaJob.payload as any).height === "number" &&
        "quality" in prismaJob.payload &&
        typeof (prismaJob.payload as any).quality === "number"
      ) {
        finalPayload = prismaJob.payload as {
          sourceUrl: string;
          width: number;
          height: number;
          quality: number;
          targetFormat?: "jpeg" | "png" | undefined;
        };
      } else {
        throw new Error(
          "Invalid or missing payload structure for ImageResize job"
        );
      }
    } else {
      throw new Error(
        "Cannot determine payload structure due to unknown mappedAppType"
      );
    }

    return {
      id: prismaJob.id,
      name: prismaJob.name,
      type: mappedAppType,
      status: mappedAppStatus,
      payload: finalPayload,
      createdAt: prismaJob.createdAt,
      updatedAt: prismaJob.updatedAt,
      attempts: prismaJob.attempts,
    } as Job;
  }

  async add(job: Job): Promise<void> {
    let prismaJobType: "EMAIL" | "IMAGE_RESIZE";
    if (job.type === TypeStatus.Email) {
      prismaJobType = "EMAIL";
    } else if (job.type === TypeStatus.ImageResize) {
      prismaJobType = "IMAGE_RESIZE";
    } else {
      throw new Error(`Unhandled application job type:`);
    }

    let prismaJobStatusString: $Enums.JobStatus;
    if (job.status === JobStatus.Pending) {
      prismaJobStatusString = "PENDING";
    } else if (job.status === JobStatus.InProgress) {
      prismaJobStatusString = "IN_PROGRESS";
    } else if (job.status === JobStatus.Done) {
      prismaJobStatusString = "DONE";
    } else if (job.status === JobStatus.Failed) {
      prismaJobStatusString = "FAILED";
    } else {
      throw new Error(`Unknown job status from Prisma: ${job.status}`);
    }

    await this.prisma.job.create({
      data: {
        type: prismaJobType,
        name: job.name,
        status: prismaJobStatusString,
        payload: job.payload as Prisma.InputJsonValue,
      },
    });
  }

  async get(id: number): Promise<Job | undefined> {
    const jobFromPrisma = await this.prisma.job.findUnique({
      where: { id: id },
    });
    if (!jobFromPrisma) {
      return undefined;
    }
    return this.mapPrismaJobToAppJob(
      (jobFromPrisma as PrismaJobPayload) ?? undefined
    );
  }

  async list(): Promise<Job[]> {
    const jobFromPrisma = await this.prisma.job.findMany();
    let appJobsArray: Job[] = [];
    for (let index = 0; index < jobFromPrisma.length; index++) {
      const prismaJobElement = jobFromPrisma[index];
      const mappedJob = this.mapPrismaJobToAppJob(
        (prismaJobElement as PrismaJobPayload) ?? undefined
      );
      if (mappedJob != undefined) {
        appJobsArray.push(mappedJob);
      }
    }
    return appJobsArray;
  }

  async getPendingJobs(): Promise<Job[]> {
    const pendingPrismaJobs = await this.prisma.job.findMany({
      where: {
        status: "PENDING",
      },
    });
    return pendingPrismaJobs
      .map((pJob) =>
        this.mapPrismaJobToAppJob((pJob as PrismaJobPayload) ?? undefined)
      )
      .filter((job): job is Job => job != undefined);
  }

  async update(id: number, updateFields: Partial<Job>): Promise<void> {
    const dataToUpdate: Prisma.JobUpdateInput = {};

    if (updateFields.name !== undefined) dataToUpdate.name = updateFields.name;
    if (updateFields.type !== undefined) {
      let prismaJobType: "EMAIL" | "IMAGE_RESIZE";
      if (updateFields.type === TypeStatus.Email) {
        prismaJobType = "EMAIL";
      } else if (updateFields.type === TypeStatus.ImageResize) {
        prismaJobType = "IMAGE_RESIZE";
      } else {
        const exhaustiveCheck: never = updateFields.type;
        throw new Error(
          `Unhandled application job type for update: ${exhaustiveCheck}`
        );
      }
      dataToUpdate.type = prismaJobType;
    }
    if (updateFields.status !== undefined) {
      let prismaJobStatus: "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";
      if (updateFields.status === JobStatus.Pending) {
        prismaJobStatus = "PENDING";
      } else if (updateFields.status === JobStatus.InProgress) {
        prismaJobStatus = "IN_PROGRESS";
      } else if (updateFields.status === JobStatus.Done) {
        prismaJobStatus = "DONE";
      } else if (updateFields.status === JobStatus.Failed) {
        prismaJobStatus = "FAILED";
      } else {
        const exhaustiveCheck: never = updateFields.status;
        throw new Error(
          `unhandled application job status for update: ${exhaustiveCheck}`
        );
      }
      dataToUpdate.status = prismaJobStatus;
    }
    if (updateFields.payload !== undefined) {
      dataToUpdate.payload = updateFields.payload as Prisma.InputJsonValue;
    }

    if (updateFields.attempts !== undefined)
      dataToUpdate.attempts = updateFields.attempts;
    if (Object.keys(dataToUpdate).length === 0) {
      throw new Error(
        `Unable to update job with id: ${id}, because there is no data provided for update.`
      );
    }
    try {
      const updatedJobFromDb = await this.prisma.job.update({
        where: { id: id },
        data: dataToUpdate,
      });
      console.log(
        `[Repository] update: Job ID ${id} updated successfully. status: ${updatedJobFromDb.status}, attempts: ${updatedJobFromDb.attempts}`
      );
    } catch (error: any) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2025"
      ) {
        console.log(`Error: Job with id ${id} not found for update.`);
        return;
      }
      throw error;
    }
  }
}
