import {registerSW} from "virtual:pwa-register";
import {toast} from "react-toastify";
import {t} from "i18next";

registerSW({
	onOfflineReady() {
		toast.info(t("pwa.offlineReady", "网站已成功离线缓存，后续可离线访问本网页"));
	},
	onNeedRefresh() {
		toast.info(t("pwa.updateRefresh", "网站已更新，刷新网页以使用最新版本！"));
	}
});
