
import  TopAntipala  from "../classes/topAntipala";

const topAntipala = TopAntipala.getInstance();


async function showAllTops(): Promise<string[]> {
    try {
        const tops = await topAntipala.getTopsList();
		return tops;
    } catch (error:any) {
        throw new Error(error.message);
    }    
};
export default showAllTops;
