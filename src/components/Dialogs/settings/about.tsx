import { BUILD_TIME, GIT_COMMIT } from "virtual:buildmeta";
import { Button, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

export const SettingsAboutTab = () => {
	const { t } = useTranslation();

	return (
		<>
			<Text as="div">
				{t("aboutModal.appName", "Apple Music-like lyrics TTML Tools")}
			</Text>
			<Text as="div" size="2" mb="4">
				{t(
					"aboutModal.description",
					"一个用于 Apple Music-like lyrics 生态的逐词歌词 TTML 编辑和时间轴工具",
				)}
			</Text>
			<Text as="div" size="2" color="gray">
				{t("aboutModal.buildDate", "构建日期：{date}", { date: BUILD_TIME })}
			</Text>
			<Text as="div" size="2" color="gray">
				{t("aboutModal.gitCommit", "Git 提交：{commit}", {
					commit:
						GIT_COMMIT === "unknown" ? (
							t("aboutModal.unknown", "unknown")
						) : (
							<Button asChild variant="ghost">
								<a
									href={`https://github.com/Steve-xmh/amll-ttml-tool/commit/${GIT_COMMIT}`}
									target="_blank"
									rel="noreferrer"
								>
									{GIT_COMMIT}
								</a>
							</Button>
						),
				})}
			</Text>
		</>
	);
};
