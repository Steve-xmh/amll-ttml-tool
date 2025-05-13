import { Button, Dialog } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const noticeLevelDialogAtom = atomWithStorage("noticeLevelDialog", 0);
const CURRENT_NOTICE_LEVEL = 1;

export const NoticeDialog = () => {
	const [noticeLevelDialog, setNoticeLevelDialog] = useAtom(
		noticeLevelDialogAtom,
	);

	return (
		<Dialog.Root open={noticeLevelDialog < CURRENT_NOTICE_LEVEL}>
			<Dialog.Content>
				<Dialog.Title>有关为何歌词格式导出的选项被删除的问题</Dialog.Title>
				<Dialog.Description>
					由于来自 Lyricify 社群的诋毁和漠视 AMLL 系列项目的态度，AMLL TTML
					Tools 移除了所有逐词格式歌词的支持。对此产生的不便非常抱歉。
					<br />
					<a
						href="https://github.com/Steve-xmh/amll-ttml-tool/issues/70"
						rel="noreferrer"
						target="_blank"
					>
						点此阅读详情
					</a>
				</Dialog.Description>
				<Dialog.Close>
					<Button
						mt="4"
						onClick={() => {
							setNoticeLevelDialog(CURRENT_NOTICE_LEVEL);
						}}
					>
						关闭
					</Button>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Root>
	);
};
