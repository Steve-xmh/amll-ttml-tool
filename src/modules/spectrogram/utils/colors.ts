/**
 * @description 频谱图调色板的生成器
 */

/**
 * @description 渐变色标
 *
 * @param pos - 位置，从 0.0 到 1.0
 * @param color - HEX 颜色字符串
 */
export type ColorStop = {
	id: string;
	pos: number;
	color: string;
};

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
	if (s === 0.0) {
		const gray = (l * 255) | 0;
		return [gray, gray, gray];
	}

	const chroma = (1.0 - Math.abs(2.0 * l - 1.0)) * s;
	const hPrime = h / 60.0;
	const secondComponent = chroma * (1.0 - Math.abs((hPrime % 2.0) - 1.0));
	const lightnessModifier = l - chroma / 2.0;

	let rPrime = 0,
		gPrime = 0,
		bPrime = 0;

	if (hPrime >= 0 && hPrime < 1) {
		[rPrime, gPrime, bPrime] = [chroma, secondComponent, 0.0];
	} else if (hPrime >= 1 && hPrime < 2) {
		[rPrime, gPrime, bPrime] = [secondComponent, chroma, 0.0];
	} else if (hPrime >= 2 && hPrime < 3) {
		[rPrime, gPrime, bPrime] = [0.0, chroma, secondComponent];
	} else if (hPrime >= 3 && hPrime < 4) {
		[rPrime, gPrime, bPrime] = [0.0, secondComponent, chroma];
	} else if (hPrime >= 4 && hPrime < 5) {
		[rPrime, gPrime, bPrime] = [secondComponent, 0.0, chroma];
	} else if (hPrime >= 5 && hPrime < 6) {
		[rPrime, gPrime, bPrime] = [chroma, 0.0, secondComponent];
	}

	const r = ((rPrime + lightnessModifier) * 255) | 0;
	const g = ((gPrime + lightnessModifier) * 255) | 0;
	const b = ((bPrime + lightnessModifier) * 255) | 0;

	return [r, g, b];
}

export function getIcyBlueColor(value: number): [number, number, number] {
	const v = Math.max(0.0, Math.min(value, 1.0));
	const h = ((((-128.0 * v + 191.0) % 256) + 256) % 256) * (360.0 / 255.0);
	const s = Math.max(0.0, Math.min(128.0 * v + 127.0, 255.0)) / 255.0;
	const l = Math.max(0.0, Math.min(255.0 * v, 255.0)) / 255.0;
	return hslToRgb(h, s, l);
}

export function getGrayscaleColor(value: number): [number, number, number] {
	const v = value * 255;
	return [v, v, v];
}

export function getGreenColor(value: number): [number, number, number] {
	const v = Math.max(0.0, Math.min(value, 1.0));
	const h = 85.0 * (360.0 / 255.0);
	const s = 1.0;
	const l = Math.max(0.0, Math.min(200.0 * v, 255.0)) / 255.0;
	return hslToRgb(h, s, l);
}

export function generatePalette(
	colorFn: (value: number) => [number, number, number],
): Uint8Array {
	const lut = new Uint8Array(256 * 4);
	for (let i = 0; i < 256; i++) {
		const [r, g, b] = colorFn(i / 255.0);
		const idx = i * 4;
		lut[idx] = r;
		lut[idx + 1] = g;
		lut[idx + 2] = b;
		lut[idx + 3] = 255;
	}
	return lut;
}

/**
 * @description 解析 HEX 颜色字符串为 RGB
 */
function parseHexColor(hex: string): [number, number, number] {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return [r, g, b];
}

/**
 * @description 线性插值
 */
function lerp(a: number, b: number, t: number): number {
	return a * (1 - t) + b * t;
}

/**
 * @description 从色标生成一个 256 色的 LUT
 *
 * @param stops 渐变色标
 * @returns 一个 1024 字节的 Uint8Array (256 * RGBA)
 */
export function generateLutFromStops(stops: ColorStop[]): Uint8Array {
	const lut = new Uint8Array(256 * 4);

	if (stops.length === 0) {
		return lut;
	}

	const sortedStops = [...stops].sort((a, b) => a.pos - b.pos);

	const parsedStops = sortedStops.map((s) => ({
		pos: s.pos,
		rgb: parseHexColor(s.color),
	}));

	for (let i = 0; i < 256; i++) {
		const currentPos = i / 255.0;

		let stopA = parsedStops[0];
		let stopB = parsedStops[parsedStops.length - 1];

		if (currentPos <= parsedStops[0].pos) {
			stopA = parsedStops[0];
			stopB = parsedStops[0];
		} else if (currentPos >= parsedStops[parsedStops.length - 1].pos) {
			stopA = parsedStops[parsedStops.length - 1];
			stopB = parsedStops[parsedStops.length - 1];
		} else {
			for (let j = 0; j < parsedStops.length - 1; j++) {
				if (
					currentPos >= parsedStops[j].pos &&
					currentPos <= parsedStops[j + 1].pos
				) {
					stopA = parsedStops[j];
					stopB = parsedStops[j + 1];
					break;
				}
			}
		}

		const range = stopB.pos - stopA.pos;
		const t = range < 1e-6 ? 0 : (currentPos - stopA.pos) / range;

		const r = lerp(stopA.rgb[0], stopB.rgb[0], t);
		const g = lerp(stopA.rgb[1], stopB.rgb[1], t);
		const b = lerp(stopA.rgb[2], stopB.rgb[2], t);

		const idx = i * 4;
		lut[idx] = r;
		lut[idx + 1] = g;
		lut[idx + 2] = b;
		lut[idx + 3] = 255;
	}

	return lut;
}
