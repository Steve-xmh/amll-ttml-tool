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
	IconButton,
	Select,
	Separator,
	Slider,
	Text,
	TextField,
	Theme,
} from "@radix-ui/themes";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { MusicNote216Filled, Play16Filled } from "@ricons/fluent";
import { Icon } from "@ricons/utils";
import { Trans } from "react-i18next";

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
			style={{ height: "unset", alignSelf: "stretch" }}
		/>
	</>
);

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
						platform: import.meta.env
							.TAURI_ENV_PLATFORM as WindowControlsProps["platform"],
						hide: !import.meta.env.TAURI_ENV_PLATFORM,
						className: styles.titlebar,
					}}
				>
					<Flex m="2" mb="0" justify="center" gap="2">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button variant="soft">
									<Trans i18nKey="topBar.menu.file">文件</Trans>
									<DropdownMenu.TriggerIcon />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Item>Open</DropdownMenu.Item>
								<DropdownMenu.Item>Save</DropdownMenu.Item>
								<DropdownMenu.Item>Close</DropdownMenu.Item>
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
								<DropdownMenu.Item>Open</DropdownMenu.Item>
								<DropdownMenu.Item>Save</DropdownMenu.Item>
								<DropdownMenu.Item>Close</DropdownMenu.Item>
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
					<Flex direction="row" gap="3" align="center">
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
				</Card>
				<Box
					m="2"
					mt="0"
					style={{
						flex: "1",
					}}
				/>
				<Card m="2" mt="0">
					<Flex gap="2" align="center">
						<IconButton variant="soft">
							<Icon>
								<MusicNote216Filled />
							</Icon>
						</IconButton>
						<IconButton variant="soft">
							<Icon>
								<Play16Filled />
							</Icon>
						</IconButton>
						<Text size="2">00:00.00</Text>
						<Slider />
						<Text size="2">00:00.00</Text>
					</Flex>
				</Card>
			</Flex>
		</Theme>
	);
}

export default App;
