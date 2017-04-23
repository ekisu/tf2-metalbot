import { Rules } from "./rules";
import { Config } from "./config";
import { MetalCrafting } from "./crafting/metal";
import { ItemDefIndex, BackpackFunctions, TradeOfferFunctions } from "./items";
import * as SteamUser from "steam-user";
import * as TeamFortress2 from "tf2";
import * as promptcreate from "prompt-sync";
import "colors";
import * as TradeOfferManager from "steam-tradeoffer-manager";
import { TradeOffer, EOfferFilter } from "steam-tradeoffer-manager";

var prompt = promptcreate();
var config = new Config("./config.json");
var client = new SteamUser();
var tf2 = new TeamFortress2(client);
var rules = new Rules(config);
var metalCrafter = new MetalCrafting(tf2);
var backpackUpdateTimeout = null;
var tradeOfferManager = new TradeOfferManager();

function promptLogin() {
    let accountName = prompt("Username: ".green);
    let password = prompt.hide("Password: ".green);
    let rememberLogin = prompt("Remember login? (y/n) ".yellow).toLowerCase() == "y";

    config.set("accountName", accountName);
    config.save();

    client.logOn({
        "accountName": accountName,
        "password": password,
        "rememberPassword": rememberLogin // With this we can get the loginKey.
    });
}

if (config.get("loginKey")) {
	console.log("We have login key, autologging...".yellow);
	client.logOn({
		"accountName": config.get("accountName"),
		"loginKey": config.get("loginKey")
	});
} else {
	promptLogin();
}

function promisifiedGetOffers(manager: TradeOfferManager, filter: EOfferFilter) : Promise<{sent: Array<TradeOffer>, received: Array<TradeOffer>}> {
	return new Promise((resolve, reject) => {
		manager.getOffers(filter, null, (err, sent, received) => {
			if (err) return reject(err);

			resolve({
				sent: sent,
				received: received
			});
		});
	});
}

async function onBackpackUpdated() {
	let usableRefineds = BackpackFunctions.refineds(tf2.backpack);
	let usableReclaimeds = BackpackFunctions.reclaimeds(tf2.backpack);
	let usableScraps = BackpackFunctions.scraps(tf2.backpack);
	let refCount = usableRefineds.length;
	let recCount = usableReclaimeds.length;
	let scrapCount = usableScraps.length;

	let statusLine = "Currently on inventory: ".magenta + "%d refined, %d reclaimed (min: %d, max: %d), %d scraps (min: %d, max: %d).".cyan;
	console.log(statusLine, refCount, recCount, rules.NeverLetReclaimedFallBelow, rules.NeverLetReclaimedGoOver, scrapCount, rules.NeverLetScrapsFallBelow, rules.NeverLetScrapsGoOver);

	if (config.get("avoidMetalInActiveTradeOffers")) {
		let { sent, received } = await promisifiedGetOffers(tradeOfferManager, TradeOfferManager.EOfferFilter.ActiveOnly);

		let allOffers = [].concat(sent, received);
		let offerItems = TradeOfferFunctions.getAllOurItemsInOffers(allOffers);
		let notInOfferItems = (item) => !offerItems.some((tradeItem) => tradeItem.id == item.id);

		usableRefineds = usableRefineds.filter(notInOfferItems);
		usableReclaimeds = usableReclaimeds.filter(notInOfferItems);
		usableScraps = usableScraps.filter(notInOfferItems);

		if (usableScraps.length < scrapCount
		    || usableReclaimeds.length < recCount
			|| usableRefineds.length < refCount) {
			console.log("Note: We have %d refined, %d reclaimed and %d scrap(s) on active trade offers.".yellow, refCount - usableRefineds.length, recCount - usableReclaimeds.length, scrapCount - usableScraps.length);
		}
	}

	var scrapDelta = 0;
	var reclaimedDelta = 0;

	if (scrapCount < rules.NeverLetScrapsFallBelow) {
		scrapDelta = rules.NeverLetScrapsFallBelow - scrapCount;
	} else if (scrapCount > rules.NeverLetScrapsGoOver) {
		scrapDelta = -(scrapCount - rules.NeverLetScrapsGoOver);
	}

	if (scrapDelta < 0) { // Delta is smaller than 0, we need less scrap.
		let reclaimedToCraft = Math.ceil(Math.abs(scrapDelta) / 3);

		console.log("Crafting ".green + "%d".blue + " reclaimed to get rid of ".green + "%d".blue + " scrap (current scraps: %d)".green, reclaimedToCraft, (-scrapDelta), scrapCount);
		for (let i = 0; i < reclaimedToCraft; i++) {
			let scrapsToUseInCraft = usableScraps.slice(i*3, i*3+3).map((item) => item.id);

			metalCrafter.combineScrap(scrapsToUseInCraft);
		}

		return; // If there is more work to do, when the backpack updates we will run this again, so no problem, I guess.
	} else if (scrapDelta > 0) {
		let reclaimedToSmelt = Math.ceil(scrapDelta / 3);
		console.log("Smelting ".green + "%d".blue + " reclaimed to obtain ".green + "%d".blue + " scrap (current scraps: %d)".green, reclaimedToSmelt, scrapDelta, scrapCount);
		if (reclaimedToSmelt > usableReclaimeds.length) {
            console.log(("We should have %d reclaimeds to balance the scraps, but we " + (usableReclaimeds.length > 0) ? ("only have " + usableReclaimeds.length) : "have none. Skipping.").magenta, reclaimedToSmelt);
            reclaimedToSmelt = usableReclaimeds.length;
        }

		for (let i = 0; i < reclaimedToSmelt; i++) {
			metalCrafter.smeltReclaimed(usableReclaimeds[i].id);
		}

		// If we haven't smelt anything, yet we should have, let it continue as we probably will smelt refined.
		if (reclaimedToSmelt > 0) return;
	}

	if (recCount < rules.NeverLetReclaimedFallBelow) {
		reclaimedDelta = rules.NeverLetReclaimedFallBelow - recCount;
	} else if (recCount > rules.NeverLetReclaimedGoOver) {
		reclaimedDelta = -(recCount - rules.NeverLetReclaimedGoOver);
	}

	if (reclaimedDelta < 0) { // Delta is smaller than 0, we need less reclaimed.
		let refinedToCraft = Math.ceil(Math.abs(reclaimedDelta) / 3);
		console.log("Crafting ".green + "%d".blue + " refined to get rid of ".green + "%d".blue + " reclaimed (current reclaimed: %d).", refinedToCraft, -reclaimedDelta, recCount);

        for (let i = 0; i < refinedToCraft; i++) {
            let reclaimedsToUseInCraft = usableReclaimeds.slice(i*3, i*3+3).map((item) => item.id);

            metalCrafter.combineReclaimed(reclaimedsToUseInCraft);
        }

        return; // If there is more work to do, when the backpack updates we will run this again, so no problem, I guess.
    } else if (reclaimedDelta > 0) {
        let refinedToSmelt = Math.ceil(reclaimedDelta / 3);
		console.log("Smelting ".green + "%d".blue + " refined to obtain ".green + "%d".blue + " reclaimed (current reclaimed: %d)".green, refinedToSmelt, reclaimedDelta, recCount);
		if (refinedToSmelt > usableRefineds.length) {
			console.log(("We should have %d refineds to balance the reclaimeds, but we " +
			            ((usableRefineds.length > 0) ? ("only have " + usableRefineds.length + ".") : "have none. Skipping.") +
						(config.get("avoidMetalInActiveTradeOffers") ? " Maybe some metal are in trade offers?" : "")).magenta,
						refinedToSmelt);
			refinedToSmelt = usableRefineds.length;
		}

        for (let i = 0; i < refinedToSmelt; i++) {
            metalCrafter.smeltRefined(usableRefineds[i].id);
        }

		if (refinedToSmelt > 0) return;
	}

	if (config.get("oneShot")) {
		console.log("oneShot is activated, exiting...".magenta);
		process.exit(0);
	}
}

function scheduleBackpackUpdate() {
	// We need the TradeOfferManager to be active if this happens.
	if (config.get("avoidMetalInActiveTradeOffers") && !tradeOfferManager.apiKey) {
		return;
	}

	if (!tf2.backpack) {
		return;
	}
	

	if (backpackUpdateTimeout != null) {
		clearTimeout(backpackUpdateTimeout);
	}
	backpackUpdateTimeout = setTimeout(() => {
		onBackpackUpdated();
		backpackUpdateTimeout = null
	}, 10000);
}

client.on("loggedOn", (details) => {
	console.log("We logged on, setting our game to TF2".cyan);
	client.setPersona(SteamUser.EPersonaState.Online);
	client.gamesPlayed(440);
});

client.on("loginKey", (key) => {
	console.log("Updating login key...".yellow);
	config.set("loginKey", key);
	config.save();
});

client.on("webSession", (sessionID: string, cookies: Array<string>) => {
	// TODO Set cookies on TradeOfferManager, later this will be used to avoid working in metals in active trade offers.
	if (!config.get("avoidMetalInActiveTradeOffers")) return;

	tradeOfferManager.setCookies(cookies, null, (err) => {
		if (err) {
			console.log("Failed to setup TradeOfferManager, and avoidMetalInActiveTradeOffers is active. Exiting with error.".red);
			throw err;
		}

		console.log("TradeOfferManager setup successfully!".green);
		scheduleBackpackUpdate();
	});
});

client.on("error", (error) => {
	switch (error.message) {
	case "InvalidPassword":
		console.log("Apparently our login is invalid. Please input your credentials again");
		promptLogin();
		break;
	case "LoggedInElsewhere":
		console.log("This account has been logged in elsewhere. Exiting...");
		process.exit(0);
		break;
	default:
		console.log("Uncaught error. This should be reported.")
		throw error;
	}
})

tf2.on("backpackLoaded", scheduleBackpackUpdate);
tf2.on("itemAcquired", (_) => scheduleBackpackUpdate());
tf2.on("itemRemoved", (_) => scheduleBackpackUpdate());
tf2.on("craftingComplete", (recipe, itemsGained) => {
	if (recipe == -1) console.log("A craft has failed.".red)
});

