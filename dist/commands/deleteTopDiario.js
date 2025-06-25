"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTopDiarioCommand = deleteTopDiarioCommand;
const utils_1 = require("../utils");
const classes_1 = require("../classes");
async function deleteTopDiarioCommand(body) {
    try {
        const args = body.trim().split(" ");
        if (args.length < 2)
            throw new Error("📛 Formato inválido. Usá: /deleteTop dd/mm/aaaa");
        const fechaInput = (0, utils_1.parseDate)(args[1]);
        await classes_1.TopDiario.delete(fechaInput);
        return `✅ Top del día ${args[1]}  eliminado correctamente.`;
    }
    catch (error) {
        throw new Error(error.message || "❌ Error inesperado al borrar el TopDiario.");
    }
}
