export = SteamID;

declare class SteamID {
	constructor(input: string);
	
	isValid() : boolean;
	getSteam2RenderedID(newerFormat?: boolean) : string;
	getSteam3RenderedID(): string;
	getSteamID64() : string;
}

