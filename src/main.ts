import { createApp } from "vue";
import { PiniaUndo } from "./utils/pinia-undo";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";

const pinia = createPinia();
pinia.use(PiniaUndo);
pinia.use(piniaPluginPersistedstate);
createApp(App).use(pinia).mount("#root");
