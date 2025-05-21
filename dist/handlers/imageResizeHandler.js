"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageResizeJobHandler = void 0;
class ImageResizeJobHandler {
    execute(job) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Job ID: ${job.id}`);
            console.log(`Job Type: ${job.type}`);
            console.log(`Target Width: ${job.payload}`);
            console.log(`Target Height: ${job.payload}`);
            console.log(`Image Quality: ${job.payload}`);
        });
    }
}
exports.ImageResizeJobHandler = ImageResizeJobHandler;
