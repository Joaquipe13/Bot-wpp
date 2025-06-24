"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loroCommand = loroCommand;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
async function loroCommand(msg, client) {
    const carpeta = path_1.default.join(__dirname, './../../audios/loro');
    const archivos = fs_1.default.readdirSync(carpeta).filter(file => file.endsWith('.opus'));
    if (archivos.length === 0) {
        throw new Error("❌ No hay audios del loro disponibles.");
    }
    const archivoElegido = archivos[Math.floor(Math.random() * archivos.length)];
    const ruta = path_1.default.join(carpeta, archivoElegido);
    const buffer = fs_1.default.readFileSync(ruta);
    const base64Audio = buffer.toString('base64');
    const media = new whatsapp_web_js_1.MessageMedia('audio/ogg; codecs=opus', base64Audio, 'loro.opus');
    await client.sendMessage(msg.from, media, {
        sendAudioAsVoice: true
    });
}
exports.default = loroCommand;
