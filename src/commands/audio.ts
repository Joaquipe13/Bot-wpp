import fs from 'fs/promises';
import path from 'path';
import { MessageMedia } from 'whatsapp-web.js';

export async function audioCommand(file: string) {
  const carpeta = path.join(__dirname, './../../audios/', file);
  const archivos = (await fs.readdir(carpeta)).filter(file => file.endsWith('.opus'));
  if (archivos.length === 0) {
    throw new Error(`❌ No hay audios del ${file} disponibles.`);
  }
  const archivoElegido = archivos[Math.floor(Math.random() * archivos.length)];
  const ruta = path.join(carpeta, archivoElegido);
  const buffer = await fs.readFile(ruta); 
  const base64Audio = buffer.toString('base64');
  const media = new MessageMedia('audio/ogg; codecs=opus', base64Audio, `${file}.opus`); 
  return media;
}