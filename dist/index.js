"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./db/database"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const bot_1 = require("./bot");
dotenv_1.default.config();
const { APP_URL, RAILWAY_STATIC_URL, PORT } = process.env;
const url = RAILWAY_STATIC_URL || APP_URL || `http://localhost:${PORT}`;
async function main() {
    const server = http_1.default.createServer();
    try {
        const dbManager = await database_1.default.getInstance();
        dbManager.getDB();
        console.log("✅ Base de datos lista y bot inicializado");
        const client = (0, bot_1.createClient)();
        (0, bot_1.registerClientEvents)(client, server);
        client.initialize();
        server.listen(PORT, () => {
            console.log(`🌐 Escuchando en: ${url}`);
        });
    }
    catch (error) {
        console.error("❌ Error al iniciar:", error);
        process.exit(1);
    }
}
main();
