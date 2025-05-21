"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeStatus = exports.JobStatus = void 0;
var JobStatus;
(function (JobStatus) {
    JobStatus["Pending"] = "PENDING";
    JobStatus["InProgress"] = "IN_PROGRESS";
    JobStatus["Done"] = "DONE";
    JobStatus["Failed"] = "FAILED";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var TypeStatus;
(function (TypeStatus) {
    TypeStatus["Email"] = "EMAIL";
    TypeStatus["ImageResize"] = "IMAGE_RESIZE";
})(TypeStatus || (exports.TypeStatus = TypeStatus = {}));
/*
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
*/
