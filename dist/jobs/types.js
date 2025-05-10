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
