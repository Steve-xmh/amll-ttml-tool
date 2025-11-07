import { createContext, type RefObject } from "react";

export const SpectrogramContext = createContext<
	RefObject<HTMLDivElement | null>
>({ current: null });
