"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartClient = restartClient;
const events_1 = require("./events");
const initClient_1 = require("./initClient");
const initClientRetry_1 = require("./initClientRetry");
function restartClient(oldClient, server) {
    console.log("🔄 Reiniciando el cliente...");
    oldClient.destroy().catch(console.error);
    const newClient = (0, initClient_1.createClient)();
    (0, events_1.registerClientEvents)(newClient, server);
    (0, initClientRetry_1.initializeClientWithRetry)(newClient);
}
