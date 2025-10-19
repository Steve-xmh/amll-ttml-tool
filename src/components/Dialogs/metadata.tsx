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
	Text,
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
		/** red for true, orange for false */
		severe?: boolean;
	};
}

export const MetadataEditor = () => {
	const [metadataEditorDialog, setMetadataEditorDialog] = useAtom(
		metadataEditorDialogAtom,
	);
	const [customKey, setCustomKey] = useState("");
	const [lyricLines, setLyricLines] = useImmerAtom(lyricLinesAtom);

	const { t } = useTranslation();

	const builtinOptions: SelectOption[] = useMemo(() => {
		const numeric = (value: string) => /^\d+$/.test(value);
		const alphanumeric = (value: string) => /^[a-zA-Z0-9]+$/.test(value);
		return [
			{
				// 歌词所匹配的歌曲名
				label: t("metadataDialog.builtinOptions.musicName", "歌曲名称"),
				value: "musicName",
			},
			{
				// 歌词所匹配的歌手名
				label: t("metadataDialog.builtinOptions.artists", "歌曲的艺术家"),
				value: "artists",
				validation: {
					verifier: (value: string) => !/^.+[,;&，；、].+$/.test(value),
					message: t(
						"metadataDialog.builtinOptions.artistsInvalidMsg",
						"如果有多个艺术家，请多次添加该键值，避免使用分隔符",
					),
				},
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
				validation: {
					verifier: numeric,
					message: t(
						"metadataDialog.builtinOptions.ncmMusicIdInvalidMsg",
						"网易云音乐 ID 应为纯数字",
					),
					severe: true,
				},
			},
			{
				// 歌词所匹配的 QQ 音乐 ID
				label: t("metadataDialog.builtinOptions.qqMusicId", "QQ 音乐 ID"),
				value: "qqMusicId",
				validation: {
					verifier: alphanumeric,
					message: t(
						"metadataDialog.builtinOptions.qqMusicIdInvalidMsg",
						"QQ 音乐 ID 应为字母或数字",
					),
					severe: true,
				},
			},
			{
				// 歌词所匹配的 Spotify 音乐 ID
				label: t("metadataDialog.builtinOptions.spotifyId", "Spotify 音乐 ID"),
				value: "spotifyId",
				validation: {
					verifier: alphanumeric,
					message: t(
						"metadataDialog.builtinOptions.spotifyIdInvalidMsg",
						"Spotify ID 应为字母或数字",
					),
					severe: true,
				},
			},
			{
				// 歌词所匹配的 Apple Music 音乐 ID
				label: t(
					"metadataDialog.builtinOptions.appleMusicId",
					"Apple Music 音乐 ID",
				),
				value: "appleMusicId",
				validation: {
					verifier: numeric,
					message: t(
						"metadataDialog.builtinOptions.appleMusicIdInvalidMsg",
						"Apple Music ID 应为纯数字",
					),
					severe: true,
				},
			},
			{
				// 歌词所匹配的 ISRC 编码
				label: t("metadataDialog.builtinOptions.isrc", "歌曲的 ISRC 号码"),
				value: "isrc",
				validation: {
					verifier: (value: string) =>
						/^[A-Z]{2}-?[A-Z0-9]{3}-?\d{2}-?\d{5}$/.test(value),
					message: t(
						"metadataDialog.builtinOptions.isrcInvalidMsg",
						"ISRC 编码格式应为 CC-XXX-YY-NNNNN",
					),
					severe: true,
				},
			},
			{
				// 逐词歌词作者 GitHub ID，例如 39523898
				label: t(
					"metadataDialog.builtinOptions.ttmlAuthorGithub",
					"逐词歌词作者 GitHub ID",
				),
				value: "ttmlAuthorGithub",
				validation: {
					verifier: numeric,
					message: t(
						"metadataDialog.builtinOptions.ttmlAuthorGithubInvalidMsg",
						"GitHub ID 应为纯数字",
					),
					severe: true,
				},
			},
			{
				// 逐词歌词作者 GitHub 用户名，例如 Steve-xmh
				label: t(
					"metadataDialog.builtinOptions.ttmlAuthorGithubLogin",
					"逐词歌词作者 GitHub 用户名",
				),
				value: "ttmlAuthorGithubLogin",
				validation: {
					verifier: (value: string) =>
						/^(?!.*--)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(
							value,
						),
					message: t(
						"metadataDialog.builtinOptions.ttmlAuthorGithubLoginInvalidMsg",
						"GitHub username should be alphanumeric or hyphens, up to 39 characters",
					),
					severe: true,
				},
			},
		];
	}, [t]);

	const toDisplayKey = useCallback(
		(key: string) => {
			const found = builtinOptions.find((v) => v.value === key);
			if (found) return found.label;
			return key;
		},
		[builtinOptions],
	);
	const toDisplayValidation = useCallback(
		(key: string) => {
			const found = builtinOptions.find((v) => v.value === key);
			if (found?.validation) return found.validation;
			return null;
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
						{lyricLines.metadata.map((v, i) => {
							const validation = toDisplayValidation(v.key);
							if (validation) {
								const error = v.value.some((val) => !validation.verifier(val));
								if (error !== !!v.error)
									setLyricLines((prev) => {
										prev.metadata[i].error = error;
									});
							}
							return (
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
																const metadataItem = prev.metadata[i];
																metadataItem.value[ii] = newValue;
																if (validation) {
																	const error = metadataItem.value.some(
																		(vv) => !validation.verifier(vv),
																	);
																	if (error !== !!metadataItem.error)
																		metadataItem.error = error;
																}
															});
														}}
														color={
															validation && v.error
																? validation.severe
																	? "red"
																	: "orange"
																: undefined
														}
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
											<Flex direction="column">
												{validation && v.error && (
													<Text
														color={validation.severe ? "red" : "orange"}
														size="1"
														mb="1"
														mt="1"
														wrap="wrap"
													>
														{validation.message}
													</Text>
												)}
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
											</Flex>
										</td>
									</tr>
								</Fragment>
							);
						})}
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
