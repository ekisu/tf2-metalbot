import { Config } from "./config"

class Rules {
	public NeverLetScrapsFallBelow : number;
	public NeverLetReclaimedFallBelow : number;
	public NeverLetScrapsGoOver : number;
	public NeverLetReclaimedGoOver : number;

	constructor(private config: Config) {
		this.NeverLetScrapsFallBelow = config.get("neverLetScrapsFallBelow", 3);
		this.NeverLetScrapsGoOver = config.get("neverLetScrapsGoOver", 6);
		this.NeverLetReclaimedFallBelow = config.get("neverLetReclaimedFallBelow", 3);
		this.NeverLetReclaimedGoOver = config.get("neverLetReclaimedGoOver", 6);

		// Without those, we could fall in a situation where we combine metal to meet the "not go over" threshold, but end up
		// with less metal than "not fall below", then melting metal, but again reaching the "not go over" threshold.
		if (this.NeverLetScrapsGoOver - this.NeverLetScrapsFallBelow < 3) {
			throw new RangeError("There should be at least a difference of 3 between NeverLetScrapsGoOver and NeverLetScrapsFallBelow");
		}

		if (this.NeverLetReclaimedGoOver - this.NeverLetReclaimedFallBelow < 3) {
			throw new RangeError("There should be at least a difference of 3 between NeverLetReclaimedGoOver and NeverLetReclaimedFallBelow");
		}
	}
}

export { Rules }
