import { Button, Card, Grid } from "@radix-ui/themes";
import { useStore } from "jotai";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import {
	keySyncEndAtom,
	keySyncNextAtom,
	keySyncStartAtom,
} from "$/states/keybindings.ts";
import { forceInvokeKeyBindingAtom } from "$/utils/keybindings.ts";
import styles from "./index.module.css";

export const TouchSyncPanel: FC = () => {
	const store = useStore();
	const { t } = useTranslation();
	return (
		<Card m="2" mt="0" style={{ flexShrink: "0" }}>
			<Grid rows="2" columns="3" gap="2" className={styles.syncButtons}>
				<Button variant="soft" size="4">
					{t("touchSyncPanel.prevWord", "跳上词")}
				</Button>
				<Button variant="soft" size="4">
					{t("touchSyncPanel.currentWord", "跳本词")}
				</Button>
				<Button variant="soft" size="4">
					{t("touchSyncPanel.nextWord", "跳下词")}
				</Button>
				<Button
					variant="soft"
					size="4"
					onMouseDown={(evt) =>
						forceInvokeKeyBindingAtom(store, keySyncStartAtom, evt.nativeEvent)
					}
					onTouchStart={(evt) =>
						forceInvokeKeyBindingAtom(store, keySyncStartAtom, evt.nativeEvent)
					}
				>
					{t("ribbonBar.syncMode.startSync", "起始轴")}
				</Button>
				<Button
					variant="soft"
					size="4"
					onClick={(evt) =>
						forceInvokeKeyBindingAtom(store, keySyncNextAtom, evt.nativeEvent)
					}
					onTouchStart={(evt) =>
						forceInvokeKeyBindingAtom(store, keySyncNextAtom, evt.nativeEvent)
					}
				>
					{t("ribbonBar.syncMode.continuousSync", "连续轴")}
				</Button>
				<Button
					variant="soft"
					size="4"
					onMouseDown={(evt) =>
						forceInvokeKeyBindingAtom(store, keySyncEndAtom, evt.nativeEvent)
					}
					onTouchStart={(evt) =>
						forceInvokeKeyBindingAtom(store, keySyncEndAtom, evt.nativeEvent)
					}
				>
					{t("ribbonBar.syncMode.endSync", "结束轴")}
				</Button>
			</Grid>
		</Card>
	);
};
