/**
 * Reference from: https://www.figma.com/community/file/1251588934545918753
 */

import type { SystemControlProps } from "./index.tsx";
import styles from "./macos.module.css";

export function MacOSSystemsControls(props: SystemControlProps) {
	return (
		<div className={styles.controls}>
			<div>
				<button
					type="button"
					className={styles.close}
					aria-label="close window button"
					onClick={props.onClosed}
				/>
				<button
					type="button"
					className={styles.minimize}
					aria-label="minimize window button"
					onClick={props.onMinimized}
				/>
				<button
					type="button"
					className={styles.zoom}
					aria-label="maximize window button"
					onClick={props.onMaximized}
				/>
			</div>
		</div>
	);
}
