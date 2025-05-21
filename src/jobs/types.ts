import { JsonValue } from "@prisma/client/runtime/library";

export enum JobStatus {
  Pending = "PENDING",
  InProgress = "IN_PROGRESS",
  Done = "DONE",
  Failed = "FAILED",
}

export enum TypeStatus {
  Email = "EMAIL",
  ImageResize = "IMAGE_RESIZE",
}

export interface BaseJob {
  id: number;
  type: TypeStatus;
  name: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  attempts: number;
}

export interface EmailJob extends BaseJob {
  type: TypeStatus.Email;
  payload: {
    destination: string;
    subject: string;
    body?: string;
  };
}
export interface ImageResizeJob extends BaseJob {
  type: TypeStatus.ImageResize;
  payload: {
    sourceUrl: string;
    width: number;
    height: number;
    quality: number; // number from 0-100
    targetFormat?: "jpeg" | "png";
  };
}

export type Job = EmailJob | ImageResizeJob;
