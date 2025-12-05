import { memo, useEffect, useRef } from "react";
import styles from "./AudioSpectrogram.module.css";

export interface TileComponentProps {
	tileId: string;
	left: number;
	width: number;
	height: number;
	canvasWidth: number;
	bitmap?: ImageBitmap;
}

export const TileComponent = memo(
	({
		tileId,
		left,
		width,
		height,
		canvasWidth,
		bitmap,
	}: TileComponentProps) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);
		const currentBitmapRef = useRef<ImageBitmap | undefined>(undefined);

		useEffect(() => {
			if (bitmap !== currentBitmapRef.current) {
				if (currentBitmapRef.current) {
					currentBitmapRef.current.close();
				}
				currentBitmapRef.current = bitmap;
			}

			if (bitmap && canvasRef.current) {
				const canvas = canvasRef.current;
				if (canvas.width !== bitmap.width) canvas.width = bitmap.width;
				if (canvas.height !== bitmap.height) canvas.height = bitmap.height;
				const ctx = canvas.getContext("2d");
				ctx?.drawImage(bitmap, 0, 0);
			}
		}, [bitmap]);

		return (
			<canvas
				ref={canvasRef}
				id={tileId}
				width={canvasWidth > 0 ? canvasWidth : 1}
				height={height}
				className={styles.tileCanvas}
				style={{
					left: `${left}px`,
					width: `${width}px`,
					backgroundColor: bitmap ? "transparent" : "var(--gray-3)",
				}}
			/>
		);
	},
);
