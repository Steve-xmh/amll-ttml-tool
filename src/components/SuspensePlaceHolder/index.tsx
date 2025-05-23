import { Flex, Spinner, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { type PropsWithChildren, Suspense } from "react";

export const SuspensePlaceHolder = (props: PropsWithChildren) => {
	return (
		<Suspense
			fallback={
				<Flex
					justify="center"
					align="center"
					width="100%"
					height="100%"
					minHeight="0"
					minWidth="0"
					direction="column"
					gap="2"
					asChild
				>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<Spinner />
						<Text color="gray" size="1">
							面板载入中...
						</Text>
					</motion.div>
				</Flex>
			}
		>
			{props.children}
		</Suspense>
	);
};

export default SuspensePlaceHolder;
