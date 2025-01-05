import { registerSW } from "virtual:pwa-register";
import { toast } from "react-toastify";
import { t } from "i18next";
import { Button, Flex } from "@radix-ui/themes";

const refresh = registerSW({
	onOfflineReady() {
		toast.info(
			t("pwa.offlineReady", "网站已成功离线缓存，后续可离线访问本网页"),
		);
	},
	onNeedRefresh() {
		toast.info(
			<Flex direction="column" gap="2" align="stretch">
				<div>
					{t("pwa.updateRefresh", "网站已更新，刷新网页以使用最新版本！")}
				</div>
				<Button
					size="2"
					onClick={() => {
						refresh(true);
					}}
				>
					{t("pwa.refresh", "刷新")}
				</Button>
			</Flex>,
		);
	},
});
