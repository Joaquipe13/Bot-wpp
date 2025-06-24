import { Message } from 'whatsapp-web.js';
import { audioCommand, pingCommand, showAllTopsCommand, uploadFinalCommand } from '../commands';
import { TopAntipala, Commands } from '../classes';


export async function handleCommand(command: string, body: string, msg: Message, client: any) {
	const topAntipala = TopAntipala.getInstance();
	const commands = Commands.getInstance();
	try {
		switch (command) {
			case "help":
			return msg.reply(commands.help());

			case "ping":
			return pingCommand(msg);

			case "topdiario":
			try {
				const tops = await showAllTopsCommand();
				return msg.reply(tops.join("\n\n"));
			} catch (err: any) {
				return msg.reply(err.message || "❌ Error al obtener el top diario.");
			}

			case "top":
			try {
				const reply = await topAntipala.getTopAntipala();
				return msg.reply(reply);
			} catch (err: any) {
				return msg.reply(err.message || "❌ Error al obtener el top.");
			}

			case "final":
			try {
				const reply = await uploadFinalCommand(body);
				await msg.reply(reply);
				const top = await topAntipala.getTopAntipala();
				return msg.reply(top);
			} catch (err: any) {
				return msg.reply(err.message || "❌ Error al cargar un final.");
			}

			case "play":
			try {
				const media = await audioCommand(body);
				return client.sendMessage(msg.from, media, {
				sendAudioAsVoice: true,
				});
			} catch (err: any) {
				
				return msg.reply(err.message || "❌ Error al obtener el audio.");
			}
		}
	} catch (error: any) {
		if (error.code === 'ECONNREFUSED') {
			await msg.reply("😴 La base de datos está en descanso. Intentá de nuevo en unos segundos.");
		} else {
			await msg.reply(error.message || "❌ Error al procesar el comando.");		
		}
	}	
}
