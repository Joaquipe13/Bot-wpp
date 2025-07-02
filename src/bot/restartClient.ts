import http from 'http';
import { registerClientEvents } from './events';
import {createClient} from './initClient';
import { initializeClientWithRetry } from './initClientRetry';
import { Client } from 'whatsapp-web.js';

export function restartClient(oldClient: Client, server: http.Server) {
	console.log("🔄 Reiniciando el cliente...");
  	oldClient.destroy().catch(console.error);
	const newClient = createClient();
	registerClientEvents(newClient, server);
	initializeClientWithRetry(newClient);
}
