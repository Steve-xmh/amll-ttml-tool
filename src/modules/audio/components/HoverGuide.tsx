import styles from "./AudioSlider.module.css";

interface HoverGuideProps {
	hoverState: {
		x: number;
		timeStr: string;
		isNearRight: boolean;
		isVisible: boolean;
	};
}

export const HoverGuide = ({ hoverState }: HoverGuideProps) => {
	if (!hoverState.isVisible && hoverState.x === 0) return null;

	return (
		<div
			className={`${styles.hoverGuide} ${
				hoverState.isVisible ? styles.hoverGuideVisible : ""
			}`}
			style={{ left: hoverState.x }}
		>
			<div
				className={`${styles.timeLabel} ${
					hoverState.isNearRight ? styles.labelRight : styles.labelLeft
				}`}
			>
				{hoverState.timeStr}
			</div>
		</div>
	);
};
