"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClientEvents = exports.createClient = void 0;
var initClient_1 = require("./initClient");
Object.defineProperty(exports, "createClient", { enumerable: true, get: function () { return initClient_1.createClient; } });
var events_1 = require("./events");
Object.defineProperty(exports, "registerClientEvents", { enumerable: true, get: function () { return events_1.registerClientEvents; } });
