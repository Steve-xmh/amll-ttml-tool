/*
 * Copyright 2023-2024 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

const timeRegexp =
	/^(((?<hour>[0-9]+):)?(?<min>[0-9]+):)?(?<sec>[0-9]+([.:]([0-9]{1,3}))?)$/;
export function parseTimespan(timeSpan: string): number {
	const matches = timeRegexp.exec(timeSpan);
	if (matches) {
		const hour = Number(matches.groups?.hour || "0");
		const min = Number(matches.groups?.min || "0");
		const sec = Number(matches.groups?.sec.replace(/:/, ".") || "0");
		return Math.floor((hour * 3600 + min * 60 + sec) * 1000);
	}
	throw new TypeError(`时间戳字符串解析失败：${timeSpan}`);
}

export function msToTimestamp(timeMS: number): string {
	let t = timeMS;
	if (!Number.isSafeInteger(t) || t < 0) {
		throw new Error(`Invalid timestamp: ${t}`);
	}
	if (t === Number.POSITIVE_INFINITY) {
		return "99:99.999";
	}
	t = timeMS / 1000;
	const secs = t % 60;
	t = (t - secs) / 60;
	const mins = t % 60;
	const hrs = (t - mins) / 60;

	const h = hrs.toString().padStart(2, "0");
	const m = mins.toString().padStart(2, "0");
	const s = secs.toFixed(3).padStart(6, "0");

	if (hrs > 0) {
		return `${h}:${m}:${s}`;
	}
	return `${m}:${s}`;
}
