
import  {TopAntipala}  from "../classes";


export async function showAllTopsCommand(): Promise<string[]> {
    try {
		const topAntipala = TopAntipala.getInstance();
        const tops = await topAntipala.getTopsList();
		return tops;
    } catch (error:any) {
        throw new Error(error.message);
    }    
};

