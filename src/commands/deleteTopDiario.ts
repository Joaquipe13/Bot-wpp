import { parseDate } from "../utils";
import {TopDiario } from "../classes";

export async function deleteTopDiarioCommand(body: string): Promise<string> {
	try {
		const args = body.trim().split(" ");
		if (args.length < 2) throw new Error("📛 Formato inválido. Usá: /deleteTop dd/mm/aaaa");
		const fechaInput = parseDate(args[1]);
		await TopDiario.delete(fechaInput)
		return `✅ Top del día ${args[1]}  eliminado correctamente.`;
	} catch (error: any) {
		throw new Error(error.message || "❌ Error inesperado al borrar el TopDiario.");
	}
}
