export function distinctBy<T, U>(array: Array<T>, comparator: ((_: T) => U)): Array<T> {
	var map: Map<U, T> = new Map<U, T>();
	for (let el of array) {
		var key: U = comparator(el);

		if (!map.has(key)) {
			map.set(key, el);
		}
	}
	
	return [...map.values()];
}


