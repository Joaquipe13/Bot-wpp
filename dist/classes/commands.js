"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
class Commands {
    constructor() { }
    static getInstance() {
        if (!Commands.instance) {
            Commands.instance = new Commands();
        }
        return Commands.instance;
    }
    exists(cmd) {
        if (Commands.commands.includes(cmd.toLowerCase())) {
            return true;
        }
        else {
            throw new Error(`El comando '/${cmd}' no existe.\n\nUse '/help' para ver la lista de comandos disponibles.`);
        }
    }
    help() {
        return Commands.commands.map(cmd => `/${cmd}`).join("\n");
    }
    getAll() {
        return [...Commands.commands];
    }
}
exports.Commands = Commands;
Commands.commands = ["help", "ping", "top", "play", "final", "topdiario"];
