"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertOpusToOgg = convertOpusToOgg;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const promises_1 = __importDefault(require("fs/promises"));
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
async function convertOpusToOgg(inputPath) {
    const outputPath = inputPath.replace(/\.opus$/, '.ogg');
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(inputPath)
            .outputOptions(['-c:a libopus', '-b:a 64k', '-vbr on'])
            .toFormat('ogg')
            .on('error', (err) => reject(err))
            .on('end', async () => {
            try {
                await promises_1.default.unlink(inputPath);
                resolve();
            }
            catch (unlinkErr) {
                reject(unlinkErr);
            }
        })
            .save(outputPath);
    });
}
