"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCommand = handleCommand;
const commands_1 = require("../commands");
const classes_1 = require("../classes");
const deleteTopDiario_1 = require("../commands/deleteTopDiario");
async function handleCommand(command, body, msg, client) {
    const topAntipala = classes_1.TopAntipala.getInstance();
    const commands = classes_1.Commands.getInstance();
    try {
        switch (command) {
            case "help":
                return msg.reply(commands.help());
            case "ping":
                return (0, commands_1.pingCommand)(msg);
            case "topdiario":
                try {
                    const tops = await (0, commands_1.showAllTopsCommand)();
                    return msg.reply(tops.join("\n\n"));
                }
                catch (err) {
                    return msg.reply(err.message || "❌ Error al obtener el top diario.");
                }
            case "top":
                try {
                    const reply = await topAntipala.getTopAntipala();
                    return msg.reply(reply);
                }
                catch (err) {
                    return msg.reply(err.message || "❌ Error al obtener el top.");
                }
            case "final":
                try {
                    const reply = await (0, commands_1.uploadFinalCommand)(body);
                    await msg.reply(reply);
                    const top = await topAntipala.getTopAntipala();
                    return msg.reply(top);
                }
                catch (err) {
                    return msg.reply(err.message || "❌ Error al cargar un final.");
                }
            case "play":
                try {
                    const media = await (0, commands_1.audioCommand)(body);
                    return client.sendMessage(msg.from, media, {
                        sendAudioAsVoice: true,
                    });
                }
                catch (err) {
                    return msg.reply(err.message || "❌ Error al obtener el audio.");
                }
            case "deletetop":
                try {
                    const reply = await (0, deleteTopDiario_1.deleteTopDiarioCommand)(body);
                    await msg.reply(reply);
                }
                catch (err) {
                    return msg.reply(err.message || "❌ Error al eliminar un top.");
                }
        }
    }
    catch (error) {
        if (error.code === 'ECONNREFUSED') {
            await msg.reply("😴 La base de datos está en descanso. Intentá de nuevo en unos segundos.");
        }
        else {
            await msg.reply(error.message || "❌ Error al procesar el comando.");
        }
    }
}
