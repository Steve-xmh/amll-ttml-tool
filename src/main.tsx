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

import {Analytics} from "@vercel/analytics/react";
import {SpeedInsights} from "@vercel/speed-insights/react";
import {Provider} from "jotai";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import * as Sentry from "@sentry/react";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "utils/pwa.ts";

Sentry.init({
	dsn: import.meta.env.SENTRY_DSN,
	integrations: [],
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<SpeedInsights />
		<Analytics />
		<Provider>
			<App />
		</Provider>
		<ToastContainer/>
	</StrictMode>,
);
