/// <reference path="../steam-user/index.d.ts"/>

import * as SteamUser from "steam-user";

export = TeamFortress2;

declare namespace TeamFortress2 {
	interface BackpackItem {
		defIndex: number;
		id: string;
	}
}

declare class TeamFortress2 {
	constructor(steam: SteamUser);

	craft(items: Array<string>, recipe: number);
	backpack: Array<TeamFortress2.BackpackItem>;
}

