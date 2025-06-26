"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClientEvents = registerClientEvents;
const showQr_1 = require("../utils/showQr");
const commands_1 = require("../commands");
const classes_1 = require("../classes");
const utils_1 = require("../utils/");
const topAntipala = classes_1.TopAntipala.getInstance();
const commands = classes_1.Commands.getInstance();
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
        const body = msg.body.trim().toLowerCase();
        if (body.startsWith("top antipala del dia")) {
            try {
                await (0, commands_1.topDiarioCommand)(body, topAntipala);
                const reply = await topAntipala.getTopAntipala();
                return msg.reply(reply);
            }
            catch (error) {
                return msg.reply(error.message || "❌ Error al procesar el top.");
            }
        }
        if (body.startsWith("/")) {
            const command = body.split(" ")[0].slice(1);
            try {
                if (commands.exists(command)) {
                    return (0, utils_1.handleCommand)(command, body, msg, client);
                }
            }
            catch (error) {
                return msg.reply(error.message || "❌ Error al procesar el comando.");
            }
        }
    });
}
