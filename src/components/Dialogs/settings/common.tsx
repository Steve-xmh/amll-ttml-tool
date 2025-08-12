import { playbackRateAtom, volumeAtom } from "$/states/audio";
import {
	LayoutMode,
	SyncJudgeMode,
	autosaveEnabledAtom,
	autosaveIntervalAtom,
	autosaveLimitAtom,
	layoutModeAtom,
	syncJudgeModeAtom,
} from "$/states/config.ts";
import {
	Flex,
	Select,
	Slider,
	Switch,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import resources from "virtual:i18next-loader";

const languageOptions: readonly string[] = Object.keys(resources);

export const SettingsCommonTab = () => {
	const [layoutMode, setLayoutMode] = useAtom(layoutModeAtom);
	const [syncJudgeMode, setSyncJudgeMode] = useAtom(syncJudgeModeAtom);
	const [volume, setVolume] = useAtom(volumeAtom);
	const [playbackRate, setPlaybackRate] = useAtom(playbackRateAtom);
	const [autosaveEnabled, setAutosaveEnabled] = useAtom(autosaveEnabledAtom);
	const [autosaveInterval, setAutosaveInterval] = useAtom(autosaveIntervalAtom);
	const [autosaveLimit, setAutosaveLimit] = useAtom(autosaveLimitAtom);
	const { t, i18n } = useTranslation();
	const currentLanguage = i18n.resolvedLanguage || i18n.language;

	const getLanguageName = (code: string, locale: string) => {
		try {
			// Define a minimal interface to avoid using any
			interface DisplayNamesLike {
				new(
					locales: string | string[],
					options: { type: string },
				): {
					of: (code: string) => string | undefined;
				};
			}
			const DN: DisplayNamesLike | undefined = (
				Intl as unknown as {
					DisplayNames?: DisplayNamesLike;
				}
			).DisplayNames;
			if (DN) {
				const dn = new DN([locale], { type: "language" });
				const nativeDn = new DN([code], { type: "language" });
				const name = dn.of(code);
				const nativeName = nativeDn.of(code) || code;
				if (name && code !== locale) return `${nativeName} (${name})`;
				return nativeName;
			}
		} catch {
			// ignore errors and fallback
		}
		return code;
	};

	return (
		<>
			{/* Language Selector */}
			<Text as="label">
				<Flex direction="column" gap="2" align="start">
					<Text>{t("settings.common.language", "界面语言")}</Text>
					<Text size="1" color="gray">
						{t("settings.common.languageDesc", "选择界面显示的语言")}
					</Text>
					<Select.Root
						value={currentLanguage}
						onValueChange={(lng) => {
							i18n.changeLanguage(lng).then(() => {
								localStorage.setItem("language", lng);
							});
						}}
					>
						<Select.Trigger />
						<Select.Content>
							{languageOptions.map((code) => (
								<Select.Item key={code} value={code}>
									{getLanguageName(code, currentLanguage)}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
				</Flex>
			</Text>

			<Text as="label">
				<Flex direction="column" gap="2" my="3" align="start">
					<Text>{t("settings.common.layoutMode", "编辑布局模式")}</Text>
					<Text size="1" color="gray">
						{t(
							"settings.common.layoutModeDesc.line1",
							"简单布局能够满足大部分使用者的基本需求",
						)}
						<br />
						{t(
							"settings.common.layoutModeDesc.line2",
							"如果你需要更加高效的打轴的话，可以考虑切换到高级模式",
						)}
					</Text>
					<Select.Root
						value={layoutMode}
						onValueChange={(v) => setLayoutMode(v as LayoutMode)}
					>
						<Select.Trigger />
						<Select.Content>
							<Select.Item value={LayoutMode.Simple}>
								{t("settings.common.layoutModeOptions.simple", "简单模式")}
							</Select.Item>
							<Select.Item value={LayoutMode.Advance}>
								{t("settings.common.layoutModeOptions.advance", "高级模式")}
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</Flex>
			</Text>

			<Text as="label">
				<Flex direction="column" gap="2" my="3" align="start">
					<Text>
						{t("settings.common.syncJudgeMode", "打轴时间戳判定模式")}
					</Text>
					<Text size="1" color="gray">
						{t(
							"settings.common.syncJudgeModeDesc",
							'设置打轴时间戳的判定模式，默认为"首个按键按下时间"。',
						)}
					</Text>
					<Select.Root
						value={syncJudgeMode}
						onValueChange={(v) => setSyncJudgeMode(v as SyncJudgeMode)}
					>
						<Select.Trigger />
						<Select.Content>
							<Select.Item value={SyncJudgeMode.FirstKeyDownTime}>
								{t(
									"settings.common.syncJudgeModeOptions.firstKeyDown",
									"首个按键按下时间",
								)}
							</Select.Item>
							<Select.Item value={SyncJudgeMode.LastKeyUpTime}>
								{t(
									"settings.common.syncJudgeModeOptions.lastKeyUp",
									"最后一个按键抬起时间",
								)}
							</Select.Item>
							<Select.Item value={SyncJudgeMode.MiddleKeyTime}>
								{t(
									"settings.common.syncJudgeModeOptions.middleKey",
									"取按键按下和抬起的中间值",
								)}
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</Flex>
			</Text>

			<Flex direction="column" gap="2" my="3" align="start">
				<Flex align="center" justify="between" style={{ alignSelf: "stretch" }}>
					<Text>{t("settings.common.volume", "音乐音量")}</Text>
					<Text wrap="nowrap" color="gray" size="1">
						{(volume * 100).toFixed()}%
					</Text>
				</Flex>
				<Slider
					min={0}
					max={1}
					defaultValue={[volume]}
					step={0.01}
					onValueChange={(v) => setVolume(v[0])}
				/>
			</Flex>

			<Flex direction="column" gap="2" my="3" align="start">
				<Flex align="center" justify="between" style={{ alignSelf: "stretch" }}>
					<Text wrap="nowrap">
						{t("settings.common.playbackRate", "播放速度")}
					</Text>
					<Text wrap="nowrap" color="gray" size="1">
						{playbackRate.toFixed(2)}x
					</Text>
				</Flex>
				<Slider
					min={0.05}
					max={2}
					defaultValue={[playbackRate]}
					step={0.05}
					onValueChange={(v) => setPlaybackRate(v[0])}
				/>
			</Flex>

			<Flex
				asChild
				p="2"
				mt="2"
				style={{
					border: "1px solid var(--gray-a5)",
					borderRadius: "var(--radius-3)",
				}}
			>
				<section>
					<Flex direction="column" gap="3">
						<Text as="label">
							<Flex gap="2" align="center" justify="between">
								<Text>
									{t("settings.common.autosave.enable", "启用自动保存")}
								</Text>
								<Switch
									checked={autosaveEnabled}
									onCheckedChange={setAutosaveEnabled}
								/>
							</Flex>
						</Text>
						<Text as="label">
							<Flex direction="column" gap="2" align="start">
								<Text>
									{t("settings.common.autosave.interval", "保存间隔 (分钟)")}
								</Text>
								<TextField.Root
									type="number"
									disabled={!autosaveEnabled}
									value={autosaveInterval}
									onChange={(e) =>
										setAutosaveInterval(
											Math.max(1, Number.parseInt(e.target.value) || 1),
										)
									}
								/>
							</Flex>
						</Text>
						<Flex direction="column" gap="2" align="start">
							<Flex
								align="center"
								justify="between"
								style={{ alignSelf: "stretch" }}
							>
								<Text>
									{t("settings.common.autosave.limit", "保留快照数量")}
								</Text>
								<Text wrap="nowrap" color="gray" size="1">
									{autosaveLimit}
								</Text>
							</Flex>
							<Slider
								min={1}
								max={50}
								disabled={!autosaveEnabled}
								value={[autosaveLimit]}
								step={1}
								onValueChange={(v) => setAutosaveLimit(v[0])}
							/>
						</Flex>
					</Flex>
				</section>
			</Flex>
		</>
	);
};
