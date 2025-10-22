/*
 * Copyright 2023-2025 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import { useAtomValue, useSetAtom } from "jotai";
import { type FC, useEffect } from "react";
import { autoDarkModeAtom, DarkMode, darkModeAtom } from "$/states/main.ts";

const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

export const DarkThemeDetector: FC = () => {
	const setDarkMode = useSetAtom(autoDarkModeAtom);
	const darkMode = useAtomValue(darkModeAtom);
	useEffect(() => {
		if (darkMode !== DarkMode.Auto) return;
		const onDarkModeChange = (e: MediaQueryListEvent) => {
			setDarkMode(e.matches);
		};
		setDarkMode(darkMediaQuery.matches);
		darkMediaQuery.addEventListener("change", onDarkModeChange);
		return () => {
			darkMediaQuery.removeEventListener("change", onDarkModeChange);
		};
	}, [darkMode, setDarkMode]);
	return null;
};

export default DarkThemeDetector;
