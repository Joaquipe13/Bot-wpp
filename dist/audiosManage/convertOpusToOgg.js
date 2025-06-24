"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformOpusFiles = transformOpusFiles;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
const carpetaPrincipal = path_1.default.join(__dirname, './../../audios');
async function transformOpusFiles() {
    try {
        const subcarpetas = await promises_1.default.readdir(carpetaPrincipal, { withFileTypes: true });
        for (const dirent of subcarpetas) {
            if (dirent.isDirectory()) {
                const subcarpetaPath = path_1.default.join(carpetaPrincipal, dirent.name);
                const archivos = await promises_1.default.readdir(subcarpetaPath);
                for (const archivo of archivos) {
                    if (archivo.endsWith('.opus')) {
                        const archivoCompleto = path_1.default.join(subcarpetaPath, archivo);
                        console.log(`🔄 Iniciando conversión de: ${archivoCompleto}`);
                        await convertOpusToOgg(archivoCompleto);
                        console.log(`✅ Terminó conversión de: ${archivoCompleto}`);
                    }
                }
            }
        }
        console.log("✅ Conversión completada.");
    }
    catch (err) {
        console.error("❌ Error al convertir audios:", err);
    }
}
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
