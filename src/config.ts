import { readFileSync, writeFileSync } from "fs";

class Config {
	private _data;

	constructor(public fileName : string) {
		this._data = JSON.parse(readFileSync(fileName).toString());
	}

	get(key: string, _default?) {
		return (this._data[key] !== undefined) ? this._data[key] : _default;
	}

	set(key: string, value) {
		this._data[key] = value;
	}

	save() {
		writeFileSync(this.fileName, JSON.stringify(this._data, null, 4));
	}
}

export { Config };
