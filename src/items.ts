import { BackpackItem } from "tf2";
import { TradeOffer, EconItem } from "steam-tradeoffer-manager";
import { distinctBy } from "./utils";

export enum ItemDefIndex {
	ScrapMetal           = 5000,
	ReclaimedMetal       = 5001,
	RefinedMetal         = 5002,
	MannCoSupplyCrateKey = 5021,
}

export namespace BackpackFunctions {
	export function filterByDefIndex(backpack: Array<BackpackItem>, defIndex: number) : Array<BackpackItem> {
		return backpack.filter((item: BackpackItem) => item.defIndex == defIndex);
	}

	export function scraps(backpack: Array<BackpackItem>) : Array<BackpackItem> {
		return filterByDefIndex(backpack, ItemDefIndex.ScrapMetal);
	}

	export function reclaimeds(backpack: Array<BackpackItem>) : Array<BackpackItem> {
		return filterByDefIndex(backpack, ItemDefIndex.ReclaimedMetal);
	}

	export function refineds(backpack: Array<BackpackItem>) : Array<BackpackItem> {
		return filterByDefIndex(backpack, ItemDefIndex.RefinedMetal);
	}

	export function keys(backpack: Array<BackpackItem>) : Array<BackpackItem> {
		return filterByDefIndex(backpack, ItemDefIndex.MannCoSupplyCrateKey);
	}
}

export namespace TradeOfferFunctions {
	export function getAllOurItemsInOffers(offers: Array<TradeOffer>) : Array<EconItem>{
		let allItems: Array<EconItem> = [].concat.apply([], offers.map((offer) => offer.itemsToGive));
		return distinctBy(allItems, (item) => item.id);
	}
}

//export { ItemDefIndex, BackpackFunctions }

