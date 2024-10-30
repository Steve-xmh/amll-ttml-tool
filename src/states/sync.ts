// 打轴设置

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const showTouchSyncPanelAtom = atomWithStorage("touchSyncPanel", false);
export const visualizeTimestampUpdateAtom = atomWithStorage(
	"visualizeTimestampUpdate",
	false,
);

export const currentEmptyBeatAtom = atom(0);
