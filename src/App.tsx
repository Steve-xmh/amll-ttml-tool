import { useEffect, useState, type FC, type PropsWithChildren } from "react";
import { WindowTitlebar, type WindowControlsProps } from "tauri-controls";
import styles from "./App.module.css";
import "@radix-ui/themes/styles.css";
import {
	Box,
	Button,
	Card,
	Checkbox,
	DropdownMenu,
	Flex,
	Grid,
	Inset,
	Select,
	Separator,
	Text,
	TextField,
	Theme,
} from "@radix-ui/themes";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Trans } from "react-i18next";
import AudioControls from "./components/AudioControls";

const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const RibbonSection: FC<PropsWithChildren<{ label: string }>> = ({
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

let controlsPlatform = import.meta.env
	.TAURI_ENV_PLATFORM as WindowControlsProps["platform"];
if (import.meta.env.TAURI_ENV_PLATFORM === "darwin") {
	controlsPlatform = "macos";
}

function App() {
	const [darkMode, setDarkMode] = useState(darkMediaQuery.matches);
	darkMediaQuery.onchange = (e) => {
		setDarkMode(e.matches);
	};

	if (import.meta.env.TAURI_ENV_PLATFORM) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			const win = getCurrentWindow();
			win.show();
			console.log(
				"import.meta.env.TAURI_ENV_PLATFORM",
				import.meta.env.TAURI_ENV_PLATFORM,
			);
		}, []);
	}

	return (
		<Theme
			appearance={darkMode ? "dark" : "light"}
			hasBackground={!import.meta.env.TAURI_ENV_PLATFORM}
			accentColor={darkMode ? "jade" : "green"}
		>
			<Flex direction="column" height="100vh">
				<WindowTitlebar
					className={darkMode ? "dark" : undefined}
					controlsOrder="platform"
					windowControlsProps={{
						platform: controlsPlatform,
						hide: !import.meta.env.TAURI_ENV_PLATFORM,
						className: styles.titlebar,
					}}
				>
					<Flex m="2" justify="center" gap="2">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button variant="soft">
									<Trans i18nKey="topBar.menu.file">文件</Trans>
									<DropdownMenu.TriggerIcon />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Item>新建 TTML 文件</DropdownMenu.Item>
								<DropdownMenu.Item>打开 TTML 文件</DropdownMenu.Item>
								<DropdownMenu.Item>保存 TTML 文件</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button variant="soft">
									<Trans i18nKey="topBar.menu.edit">编辑</Trans>
									<DropdownMenu.TriggerIcon />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Item>撤销</DropdownMenu.Item>
								<DropdownMenu.Item>重做</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
						<Select.Root defaultValue="edit">
							<Select.Trigger />
							<Select.Content>
								<Select.Item value="edit">
									<Trans i18nKey="topBar.modeBtns.edit">编辑模式</Trans>
								</Select.Item>
								<Select.Item value="preview">
									<Trans i18nKey="topBar.modeBtns.preview">预览模式</Trans>
								</Select.Item>
							</Select.Content>
						</Select.Root>
					</Flex>
				</WindowTitlebar>
				<Card m="2">
					<Inset>
						<Flex
							p="3"
							direction="row"
							gap="3"
							align="center"
							style={{
								overflowX: "auto",
							}}
						>
							<RibbonSection label="行时间戳">
								<Grid
									columns="0fr 1fr"
									gap="2"
									gapY="1"
									flexGrow="1"
									align="center"
								>
									<Text wrap="nowrap" size="1">
										起始时间
									</Text>
									<TextField.Root size="1" style={{ width: "8em" }} />
									<Text wrap="nowrap" size="1">
										结束时间
									</Text>
									<TextField.Root size="1" style={{ width: "8em" }} />
								</Grid>
							</RibbonSection>
							<RibbonSection label="词时间戳">
								<Grid
									columns="0fr 1fr"
									gap="2"
									gapY="1"
									flexGrow="1"
									align="center"
								>
									<Text wrap="nowrap" size="1">
										起始时间
									</Text>
									<TextField.Root size="1" style={{ width: "8em" }} />
									<Text wrap="nowrap" size="1">
										结束时间
									</Text>
									<TextField.Root size="1" style={{ width: "8em" }} />
									<Text wrap="nowrap" size="1">
										空拍数量
									</Text>
									<TextField.Root size="1" style={{ width: "8em" }} />
								</Grid>
							</RibbonSection>
							<RibbonSection label="内容">
								<Grid
									columns="0fr 1fr"
									gap="2"
									gapY="1"
									flexGrow="1"
									align="center"
								>
									<Text wrap="nowrap" size="1">
										单词内容
									</Text>
									<TextField.Root size="1" style={{ width: "8em" }} />
									<Text wrap="nowrap" size="1">
										单词类型
									</Text>
									<Select.Root size="1" defaultValue="none">
										<Select.Trigger />
										<Select.Content>
											<Select.Item value="none">普通</Select.Item>
											<Select.Item value="ruby">注音原词</Select.Item>
											<Select.Item value="rt">注音发音</Select.Item>
										</Select.Content>
									</Select.Root>
									<Text wrap="nowrap" size="1">
										脏词
									</Text>
									<Checkbox />
								</Grid>
							</RibbonSection>
						</Flex>
					</Inset>
				</Card>
				<Box
					m="2"
					mt="0"
					flexGrow="1"
				/>
				<Box flexShrink="1">
					
				<AudioControls />
				</Box>
			</Flex>
		</Theme>
	);
}

export default App;
