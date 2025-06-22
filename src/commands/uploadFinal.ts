import Final from '../classes/final';
import Topero from '../classes/topero';
async function uploadFinal(content:string): Promise<string> {
	try {
		const match = content.match(/^\/final\s+(\w+)\s+materia:(.+?)\s+nota:(\d+)\s+fecha:(\d{2}\/\d{2}\/\d{4})$/i);
		if (!match) {
			throw new Error("❌ Formato inválido. Usá:\n/final <nombre> materia:<texto> nota:<número> fecha:dd/mm/aaaa");
		}
		const [, nombre, materia, notaStr, fechaStr] = match;
		const nota = parseInt(notaStr, 10);
		const [dia, mes, anio] = fechaStr.split('/');
		const fecha = new Date(+anio, +mes - 1, +dia);
		const topero = await Topero.findByName(nombre.trim());
		if (!topero) {
			throw new Error(`❌ No se encontró el topero ${nombre.trim()}.`);
		}
		const final = new Final(fecha, topero, materia, nota);
		await final.save();
		let reply: string;
		if (nota < 6) {
			reply = `Lo siento ${topero.name}, la proxima sera, a estudiar 💪.`;
		}else{
			reply = `Felicidades ${topero.name} por aprobar ${materia} 🥳.`
		}
		return reply
	}catch (error: any) {
		throw new Error(error.message || "❌ Error al subir el final.");
	}


}
export default uploadFinal;