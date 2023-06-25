// import { Provider } from "jotai";
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./index.sass";
// import "./utils/am-api";

// ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
// 	<React.StrictMode>
// 		<Provider>
// 			<App />
// 		</Provider>
// 	</React.StrictMode>,
// );

import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#root");
