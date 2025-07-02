"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./db/database"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const bot_1 = require("./bot");
async function main() {
    dotenv_1.default.config();
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const server = http_1.default.createServer();
    try {
        const dbManager = await database_1.default.getInstance();
        dbManager.getDB();
        console.log("✅ Base de datos lista y bot inicializado");
        const client = (0, bot_1.createClient)();
        (0, bot_1.registerClientEvents)(client, server);
        (0, bot_1.initializeClientWithRetry)(client);
        server.listen(port, () => {
        });
    }
    catch (error) {
        console.error("❌ Error al iniciar:", error);
        process.exit(1);
    }
}
main();
