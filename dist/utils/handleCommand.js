"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCommand = handleCommand;
const commands_1 = require("../commands");
const classes_1 = require("../classes");
async function handleCommand(command, body) {
    const topAntipala = classes_1.TopAntipala.getInstance();
    const commands = classes_1.Commands.getInstance();
    try {
        switch (command) {
            case "help":
                return { type: 'text', payload: commands.help() };
            case "ping":
                return { type: 'text', payload: (0, commands_1.pingCommand)() };
            case "topdiario":
                try {
                    return { type: 'text', payload: await (0, commands_1.showAllTopsCommand)() };
                }
                catch (err) {
                    throw new Error(err.message || "❌ Error al obtener el listado de tops.");
                }
            case "top":
                try {
                    return { type: 'text', payload: await topAntipala.getTopAntipala() };
                }
                catch (err) {
                    throw new Error(err.message || "❌ Error al obtener el top.");
                }
            case "final":
                try {
                    const reply = await (0, commands_1.uploadFinalCommand)(body);
                    const top = await topAntipala.getTopAntipala();
                    return { type: 'text', payload: `${reply}\n${top}` };
                }
                catch (err) {
                    throw new Error(err.message || "❌ Error al cargar un final.");
                }
            case "falta":
                try {
                    return { type: 'text', payload: await (0, commands_1.uploadAbsencesCommand)(body) };
                }
                catch (err) {
                    throw new Error(err.message || "❌ Error al registrar la falta.");
                }
            case "play":
                try {
                    return { type: 'media', payload: await (0, commands_1.audioCommand)(body) };
                }
                catch (err) {
                    throw new Error(err.message || "❌ Error al obtener el audio.");
                }
            default:
                throw new Error("❌ Error al procesar el comando.");
        }
    }
    catch (error) {
        if (error.code === 'ECONNREFUSED') {
            throw new Error("😴 La base de datos está en descanso. Intentá de nuevo en unos segundos.");
        }
        else {
            throw new Error(error.message || "❌ Error al procesar el comando.");
        }
    }
}
