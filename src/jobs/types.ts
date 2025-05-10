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

interface BaseJob {
  id: number;
  type: TypeStatus;
  name: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageResizeJob extends BaseJob {
  type: TypeStatus.ImageResize;
  width: number;
  height: number;
  quality: number; // number from 0-100
}

export interface EmailJob extends BaseJob {
  type: TypeStatus.Email;
  destination: string;
  subject: string;
}
export type Job = EmailJob | ImageResizeJob;
