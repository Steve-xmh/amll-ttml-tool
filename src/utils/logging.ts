export function log(...messages: any[]) {
	// #if DEV
	console.log(...messages);
	// #endif
}

export function warn(...messages: any[]) {
	// #if DEV
	console.warn(...messages);
	// #endif
}

export function error(...messages: any[]) {
	console.error(...messages);
}
