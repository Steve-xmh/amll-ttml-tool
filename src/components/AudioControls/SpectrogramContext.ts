import { createContext, type RefObject } from "react";

export interface ISpectrogramContext {
	scrollContainerRef: RefObject<HTMLDivElement | null>;
	zoom: number;
	scrollLeft: number;
}

export const SpectrogramContext = createContext<ISpectrogramContext>({
	scrollContainerRef: { current: null },
	zoom: 200,
	scrollLeft: 0,
});
