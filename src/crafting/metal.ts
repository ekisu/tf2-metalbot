import * as TeamFortress2 from "tf2";
import { Recipes } from "./recipes";

export class MetalCrafting {
	constructor(public tf2: TeamFortress2) {};

	smeltRefined(itemid: string) {
		this.tf2.craft([itemid], Recipes.SmeltRefined);
	}
	
	smeltReclaimed(itemid: string) {
		this.tf2.craft([itemid], Recipes.SmeltReclaimed);
	}

	combineScrap(itemids: Array<string>) {
		this.tf2.craft(itemids, Recipes.CombineScrap);
	}

	combineReclaimed(itemids: Array<string>) {
		this.tf2.craft(itemids, Recipes.CombineReclaimed);
	}
}

