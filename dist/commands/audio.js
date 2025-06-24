"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioCommand = audioCommand;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const utils_1 = require("../utils");
async function audioCommand(body) {
    const baseDir = path_1.default.join(__dirname, './../../audios/');
    try {
        const args = body.trim().split(" ");
        const disponibles = (0, utils_1.getFoldersInPath)(baseDir);
        if (args.length < 2) {
            throw new Error(`Falta el argumento de audio. Audios disponibles: ${disponibles.join(", ")}`);
        }
        const audio = args[1].toLowerCase();
        if (!disponibles.includes(audio)) {
            throw new Error(`El audio "${audio}" no está disponible. Audios disponibles: ${disponibles.join(", ")}`);
        }
        const folder = path_1.default.join(baseDir, audio);
        const files = (await promises_1.default.readdir(folder)).filter(audio => audio.endsWith('.ogg'));
        if (files.length === 0) {
            throw new Error(`❌ No hay audios del ${audio} disponibles.`);
        }
        const selectedFile = files[Math.floor(Math.random() * files.length)];
        const ruta = path_1.default.join(folder, selectedFile);
        const buffer = await promises_1.default.readFile(ruta);
        const base64Audio = buffer.toString('base64');
        const media = new whatsapp_web_js_1.MessageMedia('audio/ogg; codecs=ogg', base64Audio, `${audio}.ogg`);
        return media;
    }
    catch (error) {
        throw new Error(error.message || `❌ Error al obtener el audio`);
    }
}
