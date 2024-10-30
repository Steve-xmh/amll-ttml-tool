/*
 * Copyright 2023-2023 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import { Flex, Separator, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useSetAtom } from "jotai";
import {
	type FC,
	type PropsWithChildren,
	forwardRef,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
} from "react";
import { ribbonBarHeightAtom } from "../../states/main";

export const RibbonSection: FC<PropsWithChildren<{ label: string }>> = ({
	children,
	label,
}) => (
	<>
		<Flex
			direction="column"
			gap="1"
			style={{
				alignSelf: "stretch",
			}}
		>
			<Flex flexGrow="1" align="center" justify="center">
				{children}
			</Flex>
			<Text align="center" color="gray" size="1">
				{label}
			</Text>
		</Flex>
		<Separator
			orientation="vertical"
			size="4"
			style={{ height: "unset", alignSelf: "stretch", minWidth: "1px" }}
		/>
	</>
);

export const RibbonFrame = forwardRef<HTMLDivElement | null, PropsWithChildren>(
	({ children }, ref) => {
		const setRibbonBarHeight = useSetAtom(ribbonBarHeightAtom);
		const frameRef = useRef<HTMLDivElement>(null);

		useLayoutEffect(() => {
			if (!frameRef.current) return;
			const obs = new ResizeObserver(() => {
				if (!frameRef.current) return;
				setRibbonBarHeight(frameRef.current.clientHeight);
			});
			obs.observe(frameRef.current);
			return () => obs.disconnect();
		}, [setRibbonBarHeight]);

		useImperativeHandle(ref, () => frameRef.current, []);

		return (
			<Flex
				p="3"
				direction="row"
				gap="3"
				align="center"
				style={{
					overflowX: "auto",
					overflowY: "visible",
					// position: "absolute",
				}}
				asChild
			>
				<motion.div
					initial={{ x: 10, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: -10, opacity: 0 }}
					layout
					ref={frameRef}
				>
					{children}
				</motion.div>
			</Flex>
		);
	},
);
