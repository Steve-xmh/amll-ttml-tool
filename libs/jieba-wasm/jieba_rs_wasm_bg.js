let wasm;
export function __wbg_set_wasm(val) {
	wasm = val;
}

const lTextDecoder =
	typeof TextDecoder === "undefined"
		? (0, module.require)("util").TextDecoder
		: TextDecoder;

let cachedTextDecoder = new lTextDecoder("utf-8", {
	ignoreBOM: true,
	fatal: true,
});

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
	if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
		cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
	}
	return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
	ptr = ptr >>> 0;
	return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
	if (heap_next === heap.length) heap.push(heap.length + 1);
	const idx = heap_next;
	heap_next = heap[idx];

	heap[idx] = obj;
	return idx;
}

function getObject(idx) {
	return heap[idx];
}

function dropObject(idx) {
	if (idx < 132) return;
	heap[idx] = heap_next;
	heap_next = idx;
}

function takeObject(idx) {
	const ret = getObject(idx);
	dropObject(idx);
	return ret;
}

function debugString(val) {
	// primitive types
	const type = typeof val;
	if (type == "number" || type == "boolean" || val == null) {
		return `${val}`;
	}
	if (type == "string") {
		return `"${val}"`;
	}
	if (type == "symbol") {
		const description = val.description;
		if (description == null) {
			return "Symbol";
		} else {
			return `Symbol(${description})`;
		}
	}
	if (type == "function") {
		const name = val.name;
		if (typeof name == "string" && name.length > 0) {
			return `Function(${name})`;
		} else {
			return "Function";
		}
	}
	// objects
	if (Array.isArray(val)) {
		const length = val.length;
		let debug = "[";
		if (length > 0) {
			debug += debugString(val[0]);
		}
		for (let i = 1; i < length; i++) {
			debug += ", " + debugString(val[i]);
		}
		debug += "]";
		return debug;
	}
	// Test for built-in
	const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
	let className;
	if (builtInMatches.length > 1) {
		className = builtInMatches[1];
	} else {
		// Failed to match the standard '[object ClassName]'
		return toString.call(val);
	}
	if (className == "Object") {
		// we're a user defined class or Object
		// JSON.stringify avoids problems with cycles, and is generally much
		// easier than looping through ownProperties of `val`.
		try {
			return "Object(" + JSON.stringify(val) + ")";
		} catch (_) {
			return "Object";
		}
	}
	// errors
	if (val instanceof Error) {
		return `${val.name}: ${val.message}\n${val.stack}`;
	}
	// TODO we could test for more things here, like `Set`s and `Map`s.
	return className;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder =
	typeof TextEncoder === "undefined"
		? (0, module.require)("util").TextEncoder
		: TextEncoder;

let cachedTextEncoder = new lTextEncoder("utf-8");

const encodeString =
	typeof cachedTextEncoder.encodeInto === "function"
		? function (arg, view) {
				return cachedTextEncoder.encodeInto(arg, view);
		  }
		: function (arg, view) {
				const buf = cachedTextEncoder.encode(arg);
				view.set(buf);
				return {
					read: arg.length,
					written: buf.length,
				};
		  };

function passStringToWasm0(arg, malloc, realloc) {
	if (realloc === undefined) {
		const buf = cachedTextEncoder.encode(arg);
		const ptr = malloc(buf.length, 1) >>> 0;
		getUint8Memory0()
			.subarray(ptr, ptr + buf.length)
			.set(buf);
		WASM_VECTOR_LEN = buf.length;
		return ptr;
	}

	let len = arg.length;
	let ptr = malloc(len, 1) >>> 0;

	const mem = getUint8Memory0();

	let offset = 0;

	for (; offset < len; offset++) {
		const code = arg.charCodeAt(offset);
		if (code > 0x7f) break;
		mem[ptr + offset] = code;
	}

	if (offset !== len) {
		if (offset !== 0) {
			arg = arg.slice(offset);
		}
		ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
		const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
		const ret = encodeString(arg, view);

		offset += ret.written;
	}

	WASM_VECTOR_LEN = offset;
	return ptr;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
	if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
		cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
	}
	return cachedInt32Memory0;
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
	if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
		cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
	}
	return cachedUint32Memory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
	ptr = ptr >>> 0;
	const mem = getUint32Memory0();
	const slice = mem.subarray(ptr / 4, ptr / 4 + len);
	const result = [];
	for (let i = 0; i < slice.length; i++) {
		result.push(takeObject(slice[i]));
	}
	return result;
}
/**
 * @param {string} text
 * @param {boolean} hmm
 * @returns {any[]}
 */
export function cut(text, hmm) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			text,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		wasm.cut(retptr, ptr0, len0, hmm);
		var r0 = getInt32Memory0()[retptr / 4 + 0];
		var r1 = getInt32Memory0()[retptr / 4 + 1];
		var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
		wasm.__wbindgen_free(r0, r1 * 4);
		return v2;
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {string} text
 * @returns {any[]}
 */
export function cut_all(text) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			text,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		wasm.cut_all(retptr, ptr0, len0);
		var r0 = getInt32Memory0()[retptr / 4 + 0];
		var r1 = getInt32Memory0()[retptr / 4 + 1];
		var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
		wasm.__wbindgen_free(r0, r1 * 4);
		return v2;
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {string} text
 * @param {boolean} hmm
 * @returns {any[]}
 */
export function cut_for_search(text, hmm) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			text,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		wasm.cut_for_search(retptr, ptr0, len0, hmm);
		var r0 = getInt32Memory0()[retptr / 4 + 0];
		var r1 = getInt32Memory0()[retptr / 4 + 1];
		var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
		wasm.__wbindgen_free(r0, r1 * 4);
		return v2;
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {string} text
 * @param {string} mode
 * @param {boolean} hmm
 * @returns {any[]}
 */
export function tokenize(text, mode, hmm) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			text,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		const ptr1 = passStringToWasm0(
			mode,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len1 = WASM_VECTOR_LEN;
		wasm.tokenize(retptr, ptr0, len0, ptr1, len1, hmm);
		var r0 = getInt32Memory0()[retptr / 4 + 0];
		var r1 = getInt32Memory0()[retptr / 4 + 1];
		var r2 = getInt32Memory0()[retptr / 4 + 2];
		var r3 = getInt32Memory0()[retptr / 4 + 3];
		if (r3) {
			throw takeObject(r2);
		}
		var v3 = getArrayJsValueFromWasm0(r0, r1).slice();
		wasm.__wbindgen_free(r0, r1 * 4);
		return v3;
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

function isLikeNone(x) {
	return x === undefined || x === null;
}
/**
 * @param {string} word
 * @param {number | undefined} freq
 * @param {string | undefined} tag
 * @returns {number}
 */
export function add_word(word, freq, tag) {
	const ptr0 = passStringToWasm0(
		word,
		wasm.__wbindgen_malloc,
		wasm.__wbindgen_realloc,
	);
	const len0 = WASM_VECTOR_LEN;
	var ptr1 = isLikeNone(tag)
		? 0
		: passStringToWasm0(tag, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
	var len1 = WASM_VECTOR_LEN;
	const ret = wasm.add_word(
		ptr0,
		len0,
		!isLikeNone(freq),
		isLikeNone(freq) ? 0 : freq,
		ptr1,
		len1,
	);
	return ret >>> 0;
}

export function __wbindgen_string_new(arg0, arg1) {
	const ret = getStringFromWasm0(arg0, arg1);
	return addHeapObject(ret);
}

export function __wbindgen_object_drop_ref(arg0) {
	takeObject(arg0);
}

export function __wbindgen_object_clone_ref(arg0) {
	const ret = getObject(arg0);
	return addHeapObject(ret);
}

export function __wbg_new_1e7c00339420672b() {
	const ret = new Object();
	return addHeapObject(ret);
}

export function __wbindgen_number_new(arg0) {
	const ret = arg0;
	return addHeapObject(ret);
}

export function __wbg_set_1754fb90457a8cce(arg0, arg1, arg2) {
	getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
}

export function __wbg_new_d258248ed531ff54(arg0, arg1) {
	const ret = new Error(getStringFromWasm0(arg0, arg1));
	return addHeapObject(ret);
}

export function __wbindgen_debug_string(arg0, arg1) {
	const ret = debugString(getObject(arg1));
	const ptr1 = passStringToWasm0(
		ret,
		wasm.__wbindgen_malloc,
		wasm.__wbindgen_realloc,
	);
	const len1 = WASM_VECTOR_LEN;
	getInt32Memory0()[arg0 / 4 + 1] = len1;
	getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}

export function __wbindgen_throw(arg0, arg1) {
	throw new Error(getStringFromWasm0(arg0, arg1));
}
