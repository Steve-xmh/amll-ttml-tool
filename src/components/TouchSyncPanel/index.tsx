import {
	keySyncEndAtom,
	keySyncNextAtom,
	keySyncStartAtom,
} from "$/states/keybindings.ts";
import { forceInvokeKeyBindingAtom } from "$/utils/keybindings.ts";
import { Button, Card, Grid } from "@radix-ui/themes";
import { useStore } from "jotai";
import type { FC } from "react";

export const TouchSyncPanel: FC = () => {
	const store = useStore();
	return (
		<Card m="2" mt="0" style={{ flexShrink: "0" }}>
			<Grid rows="2" columns="3" gap="2">
				<Button variant="soft" size="4">
					跳上词
				</Button>
				<Button variant="soft" size="4">
					跳本词
				</Button>
				<Button variant="soft" size="4">
					跳下词
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
					起始轴
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
					连续轴
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
					结束轴
				</Button>
			</Grid>
		</Card>
	);
};
