import { Message } from "whatsapp-web.js";
import  TopAntipala  from "../classes/topAntipala";
import TopDiario from "../classes/topDiario";
import Topero from "../classes/topero";

const topAntipala = TopAntipala.getInstance();


export async function topDiarioCommand(toperos:Topero[], date:Date): Promise<void> {
    const topDiario = new TopDiario(date, toperos);
    try {
        await topDiario.save();
    } catch (error:any) {
        throw new Error(error.message);
    }    
    
};
const topDiario = new TopDiario(new Date(), []);