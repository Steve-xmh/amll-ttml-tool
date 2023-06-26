import { createApp } from "vue";
import { PiniaUndo } from "./utils/pinia-undo";
import { createPinia } from "pinia";
import App from "./App.vue";

const pinia = createPinia();
pinia.use(PiniaUndo);
createApp(App).use(pinia).mount("#root");
