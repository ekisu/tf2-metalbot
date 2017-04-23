export = TradeOfferManager;

declare namespace TradeOfferManager {
	enum EOfferFilter {
		ActiveOnly = 1,
		HistoricalOnly = 2,
		All = 3
	}

	interface EconItem {
		id: string;
		assetid: string;
	}

	interface TradeOffer {
		manager: TradeOfferManager;
		id: string;
		itemsToGive: Array<EconItem>;
		itemsToReceive: Array<EconItem>;
	}
}

declare class TradeOfferManager {
	constructor(options);

	setCookies(cookies: Array<string>, familyViewPin?: string, callback?);
	getOffers(filter: TradeOfferManager.EOfferFilter,
	          callback: ((err, sent: Array<TradeOfferManager.TradeOffer>) => void),
			  received: Array<TradeOfferManager.TradeOffer>);
}

