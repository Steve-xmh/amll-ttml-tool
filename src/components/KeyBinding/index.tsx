import { Kbd } from "@radix-ui/themes";
import { useAtomValue } from "jotai";
import type { FC } from "react";
import {
	formatKeyBindings,
	type useKeyBindingAtom,
} from "$/utils/keybindings.ts";

export const KeyBinding: FC<{
	kbdAtom: Parameters<typeof useKeyBindingAtom>[0];
}> = ({ kbdAtom }) => {
	const kbd = useAtomValue(kbdAtom);
	const keys = formatKeyBindings(kbd);
	return <Kbd>{keys}</Kbd>;
};
