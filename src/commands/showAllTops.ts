
import  TopAntipala  from "../classes/topAntipala";

const topAntipala = TopAntipala.getInstance();


export async function showAllTopsCommand(): Promise<string[]> {
    try {
        const tops = await topAntipala.getTopsList();
		return tops;
    } catch (error:any) {
        throw new Error(error.message);
    }    
};

