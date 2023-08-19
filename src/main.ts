import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { createApp } from "vue";
import { PiniaUndo } from "./utils/pinia-undo";
import { createPinia } from "pinia";
import { i18n } from "./i18n";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";

const pinia = createPinia();
pinia.use(PiniaUndo);
pinia.use(piniaPluginPersistedstate);
createApp(App).use(pinia).use(i18n).mount("#root");
