import { metadataEditorDialogAtom } from "$/states/dialogs.ts";
import { lyricLinesAtom } from "$/states/main.ts";
import {
	Add16Regular,
	Delete16Regular,
	Info16Regular,
} from "@fluentui/react-icons";
import {
	Button,
	Dialog,
	DropdownMenu,
	Flex,
	IconButton,
	TextField,
} from "@radix-ui/themes";
import { useAtom } from "jotai";
import { useImmerAtom } from "jotai-immer";
import { Fragment, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./metadata.module.css";

interface SelectOption {
	label: string;
	value: string;
	validation?: {
		verifier: (value: string) => boolean;
		message: string;
		mandatory?: boolean;
	};
}

export const MetadataEditor = () => {
	const [metadataEditorDialog, setMetadataEditorDialog] = useAtom(
		metadataEditorDialogAtom,
	);
	const [customKey, setCustomKey] = useState("");
	const [lyricLines, setLyricLines] = useImmerAtom(lyricLinesAtom);

	const { t } = useTranslation();

	const builtinOptions: SelectOption[] = useMemo(
		() => [
			{
				// 歌词所匹配的歌曲名
				label: t("metadataDialog.builtinOptions.musicName", "歌曲名称"),
				value: "musicName",
			},
			{
				// 歌词所匹配的歌手名
				label: t("metadataDialog.builtinOptions.artists", "歌曲的艺术家"),
				value: "artists",
			},
			{
				// 歌词所匹配的专辑名
				label: t("metadataDialog.builtinOptions.album", "歌曲的专辑名"),
				value: "album",
			},
			{
				// 歌词所匹配的网易云音乐 ID
				label: t("metadataDialog.builtinOptions.ncmMusicId", "网易云音乐 ID"),
				value: "ncmMusicId",
			},
			{
				// 歌词所匹配的 QQ 音乐 ID
				label: t("metadataDialog.builtinOptions.qqMusicId", "QQ 音乐 ID"),
				value: "qqMusicId",
			},
			{
				// 歌词所匹配的 Spotify 音乐 ID
				label: t("metadataDialog.builtinOptions.spotifyId", "Spotify 音乐 ID"),
				value: "spotifyId",
			},
			{
				// 歌词所匹配的 Apple Music 音乐 ID
				label: t(
					"metadataDialog.builtinOptions.appleMusicId",
					"Apple Music 音乐 ID",
				),
				value: "appleMusicId",
			},
			{
				// 歌词所匹配的 ISRC 编码
				label: t("metadataDialog.builtinOptions.isrc", "歌曲的 ISRC 号码"),
				value: "isrc",
			},
			{
				// 逐词歌词作者 GitHub ID，例如 39523898
				label: t(
					"metadataDialog.builtinOptions.ttmlAuthorGithub",
					"逐词歌词作者 GitHub ID",
				),
				value: "ttmlAuthorGithub",
			},
			{
				// 逐词歌词作者 GitHub 用户名，例如 Steve-xmh
				label: t(
					"metadataDialog.builtinOptions.ttmlAuthorGithubLogin",
					"逐词歌词作者 GitHub 用户名",
				),
				value: "ttmlAuthorGithubLogin",
			},
		],
		[t],
	);

	const toDisplayKey = useCallback(
		(key: string) => {
			const found = builtinOptions.find((v) => v.value === key);
			if (found) return found.label;
			return key;
		},
		[builtinOptions],
	);

	return (
		<Dialog.Root
			open={metadataEditorDialog}
			onOpenChange={setMetadataEditorDialog}
		>
			<Dialog.Content>
				<Dialog.Title>元数据编辑器</Dialog.Title>
				<table className={styles.metadataTable}>
					<thead>
						<tr>
							<th style={{ width: "1%" }}>元数据类型</th>
							<th>值</th>
						</tr>
					</thead>
					<tbody>
						{lyricLines.metadata.length === 0 && (
							<tr
								style={{
									height: "4em",
								}}
							>
								<td
									colSpan={2}
									style={{ color: "var(--gray-9)", textAlign: "center" }}
								>
									无任何元数据
								</td>
							</tr>
						)}
						{lyricLines.metadata.map((v, i) => (
							<Fragment key={`metadata-${v.key}`}>
								{v.value.map((vv, ii) => (
									<tr key={`metadata-${v.key}-${ii}`}>
										<td>{ii === 0 && toDisplayKey(v.key)}</td>
										<td>
											<Flex gap="1" ml="2" mt="1">
												<TextField.Root
													value={vv}
													className={styles.metadataInput}
													onChange={(e) => {
														const newValue = e.currentTarget.value;
														setLyricLines((prev) => {
															prev.metadata[i].value[ii] = newValue;
														});
													}}
												/>
												<IconButton
													variant="soft"
													onClick={() => {
														setLyricLines((prev) => {
															prev.metadata[i].value.splice(ii, 1);
															if (prev.metadata[i].value.length === 0) {
																prev.metadata.splice(i, 1);
															}
														});
													}}
												>
													<Delete16Regular />
												</IconButton>
											</Flex>
										</td>
									</tr>
								))}
								<tr className={styles.newItemLine}>
									<td />
									<td className={styles.newItemBtnRow}>
										<Button
											variant="soft"
											my="1"
											onClick={() => {
												setLyricLines((prev) => {
													prev.metadata[i].value.push("");
												});
											}}
										>
											添加
										</Button>
									</td>
								</tr>
							</Fragment>
						))}
					</tbody>
				</table>
				<Flex
					gap="1"
					direction={{
						sm: "row",
						initial: "column",
					}}
				>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							style={{
								flex: "1 0 auto",
							}}
						>
							<Button variant="soft">
								添加新键值
								<DropdownMenu.TriggerIcon />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<Flex gap="1">
								<TextField.Root
									style={{
										flexGrow: "1",
									}}
									placeholder="自定义键名"
									value={customKey}
									onChange={(e) => setCustomKey(e.currentTarget.value)}
								/>
								<IconButton
									variant="soft"
									onClick={() => {
										setLyricLines((prev) => {
											const existsKey = prev.metadata.find(
												(k) => k.key === customKey,
											);
											if (existsKey) {
												existsKey.value.push("");
											} else {
												prev.metadata.push({
													key: customKey,
													value: [""],
												});
											}
										});
									}}
								>
									<Add16Regular />
								</IconButton>
							</Flex>
							{builtinOptions.map((v) => (
								<DropdownMenu.Item
									key={`builtin-option-${v.value}`}
									shortcut={v.value}
									onClick={() => {
										setLyricLines((prev) => {
											const existsKey = prev.metadata.find(
												(k) => k.key === v.value,
											);
											if (existsKey) {
												existsKey.value.push("");
											} else {
												prev.metadata.push({
													key: v.value,
													value: [""],
												});
											}
										});
									}}
								>
									{v.label}
								</DropdownMenu.Item>
							))}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<Button
						style={{
							flex: "1 0 auto",
						}}
						variant="soft"
						onClick={() => {
							setLyricLines((prev) => {
								for (const option of builtinOptions) {
									const existsKey = prev.metadata.find(
										(k) => k.key === option.value,
									);
									if (!existsKey) {
										prev.metadata.push({
											key: option.value,
											value: [""],
										});
									}
								}
							});
						}}
					>
						一键添加所有预设键
					</Button>
					<Button asChild variant="soft">
						<a
							target="_blank"
							rel="noreferrer"
							href="https://github.com/Steve-xmh/amll-ttml-tool/wiki/%E6%AD%8C%E8%AF%8D%E5%85%83%E6%95%B0%E6%8D%AE"
						>
							<Info16Regular />
							了解详情
						</a>
					</Button>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
};
