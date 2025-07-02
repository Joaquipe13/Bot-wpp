
import http from "http";
import {registerClientEvents} from "./events";
import { createClient } from "./initClient";
import { initializeClientWithRetry } from "./initClientRetry";

export function restartClient(server: http.Server) {
  console.log("🔄 Reiniciando el cliente...");
  const newClient = createClient();
  registerClientEvents(newClient, server);
  initializeClientWithRetry(newClient);
}