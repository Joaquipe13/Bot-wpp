import fs from 'fs/promises';
import path from 'path';
import { MessageMedia } from 'whatsapp-web.js';
import { getFoldersInPath } from '../utils';
export async function audioCommand(body: string) {
	const baseDir = path.join(__dirname, './../../audios/');
	try {
		const args = body.trim().split(" ");
		const disponibles = getFoldersInPath(baseDir);
		if (args.length < 2) {
			throw new Error(`Falta el argumento de audio. Audios disponibles: ${disponibles.join(", ")}`);
		}
		const audio = args[1];
		if (!disponibles.includes(audio)) {
			throw new Error(`El audio "${audio}" no está disponible. Audios disponibles: ${disponibles.join(", ")}`);
		}
		const folder = path.join(baseDir, audio);
		const files = (await fs.readdir(folder)).filter(audio => audio.endsWith('.ogg'));
		if (files.length === 0) {
			throw new Error(`❌ No hay audios del ${audio} disponibles.`);
		}
		const selectedFile = files[Math.floor(Math.random() * files.length)];
		const ruta = path.join(folder, selectedFile);
		const buffer = await fs.readFile(ruta); 
		const base64Audio = buffer.toString('base64');
		const media = new MessageMedia('audio/ogg; codecs=ogg', base64Audio, `${audio}.ogg`); 
		return media;
	} catch (error: any) {
		throw new Error(error.message||`❌ Error al obtener el audio`);
	}
}