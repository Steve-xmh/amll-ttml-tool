/**
 * @description 拖拽文件到应用上方时显示的遮罩层
 */

import { ArrowUploadRegular } from "@fluentui/react-icons";
import { Flex, Text } from "@radix-ui/themes";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { isGlobalFileDraggingAtom } from "$/states/main";

export const GlobalDragOverlay = () => {
	const isDragging = useAtomValue(isGlobalFileDraggingAtom);
	const { t } = useTranslation();

	return (
		<AnimatePresence>
			{isDragging && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.1 }}
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 9999,
						backdropFilter: "blur(4px)",
						pointerEvents: "none",
					}}
				>
					<Flex
						direction="column"
						align="center"
						justify="center"
						width="100%"
						height="100%"
						style={{ background: "rgba(0, 0, 0, 0.6)" }}
					>
						<ArrowUploadRegular style={{ fontSize: 64, color: "white" }} />
						<Text
							size="8"
							weight="bold"
							style={{ color: "white", marginTop: "20px" }}
						>
							{t("globalDragOverlay.title", "拖放到此处以加载")}
						</Text>
					</Flex>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
