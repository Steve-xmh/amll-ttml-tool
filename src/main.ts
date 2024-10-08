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

import { createApp } from "vue";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import Main from "./Main.vue";
import { i18n } from "./i18n";
import { pinia } from "./store";

window.document.addEventListener("keydown", (evt) => {
	// 阻止非编辑状态下的空格滚动
	const el = (evt.target as HTMLElement).nodeName;
	if (el !== "TEXTAREA" && el !== "INPUT") {
		if (evt.code === "Space") {
			evt.preventDefault();
		}
	}
});

createApp(Main).use(pinia).use(i18n).mount("#root");
