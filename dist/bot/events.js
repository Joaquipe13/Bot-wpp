"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClientEvents = registerClientEvents;
const showQr_1 = require("../utils/showQr");
const commands_1 = require("../commands");
const classes_1 = require("../classes");
const utils_1 = require("../utils/");
const topAntipala = classes_1.TopAntipala.getInstance();
function registerClientEvents(client, server) {
    (0, showQr_1.showQr)(client, (handler) => {
        server.on("request", handler);
    });
    client.on("authenticated", () => {
        console.log("🔐 Autenticado con éxito.");
    });
    client.on("auth_failure", (msg) => {
        console.error("❌ Falló la autenticación:", msg);
    });
    client.on("disconnected", (reason) => {
        console.warn("⚠️ Desconectado:", reason);
    });
    client.on("ready", () => {
        console.log(client.info);
    });
    client.on("message", async (msg) => {
        try {
            const body = msg.body.trim().toLowerCase();
            const userId = msg.author ? msg.author.split("@")[0] : msg.from.split("@")[0];
            if (body.startsWith("top antipala del dia")) {
                try {
                    if (classes_1.Commands.hasPermission(userId)) {
                        await (0, commands_1.topDiarioCommand)(body, topAntipala);
                        const reply = await topAntipala.getTopAntipala();
                        console.log("📊 Top Antipala del día:", reply);
                        return msg.reply(reply);
                    }
                }
                catch (error) {
                    return msg.reply(error.message || "❌ Error al procesar el top.");
                }
            }
            if (body.startsWith("/")) {
                try {
                    const command = body.split(" ")[0].slice(1).toLowerCase();
                    if (command === "help") {
                        const helpMessage = classes_1.Commands.getInstance().help(userId);
                        return msg.reply(helpMessage);
                    }
                    if (classes_1.Commands.exists(command)) {
                        classes_1.Commands.hasPermission(userId, command);
                        const result = await (0, utils_1.handleCommand)(command, body);
                        console.log(`${userId}\n🔍 Comando ejecutado: ${command}`);
                        if (result.type === 'text') {
                            return msg.reply(result.payload);
                        }
                        else if (result.type === 'media') {
                            return client.sendMessage(msg.from, result.payload, { sendAudioAsVoice: true });
                        }
                    }
                }
                catch (error) {
                    return msg.reply(error.message || "❌ Error al procesar el comando.");
                }
            }
        }
        catch (error) {
            console.error("💥 Error no capturado:", error);
            console.error("Mensaje que causó el error:", msg.body);
            return msg.reply(error.message || "❌ Ocurrió un error inesperado.");
        }
    });
}
