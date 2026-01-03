import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpectrogramResizeProps {
	initialHeight: number;
	minHeight?: number;
	maxHeight?: number;
	onCommit: (newHeight: number) => void;
}

export const useSpectrogramResize = ({
	initialHeight,
	minHeight = 100,
	maxHeight = 800,
	onCommit,
}: UseSpectrogramResizeProps) => {
	const [height, setHeight] = useState(initialHeight);
	const [isResizing, setIsResizing] = useState(false);
	const heightRef = useRef(height);

	useEffect(() => {
		if (!isResizing) {
			setHeight(initialHeight);
		}
	}, [initialHeight, isResizing]);

	useEffect(() => {
		heightRef.current = height;
	}, [height]);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			setIsResizing(true);
			const startY = e.clientY;
			const startHeight = heightRef.current;

			document.body.style.cursor = "ns-resize";
			document.body.style.userSelect = "none";

			const handleMouseMove = (ev: MouseEvent) => {
				const deltaY = startY - ev.clientY;
				const newHeight = Math.max(
					minHeight,
					Math.min(maxHeight, startHeight + deltaY),
				);
				setHeight(newHeight);
			};

			const handleMouseUp = () => {
				setIsResizing(false);

				document.body.style.cursor = "";
				document.body.style.userSelect = "";

				window.removeEventListener("mousemove", handleMouseMove);
				window.removeEventListener("mouseup", handleMouseUp);
				onCommit(heightRef.current);
			};

			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		},
		[minHeight, maxHeight, onCommit],
	);

	useEffect(() => {
		return () => {
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, []);

	return {
		height,
		isResizing,
		resizeHandleProps: {
			onMouseDown: handleMouseDown,
		},
	};
};
