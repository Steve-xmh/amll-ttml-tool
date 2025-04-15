import { Button, Text } from "@radix-ui/themes";
import { BUILD_TIME, GIT_COMMIT } from "virtual:buildmeta";

export const SettingsAboutTab = () => {
	return (
		<>
			<Text as="div">Apple Music-like lyrics TTML Tools</Text>
			<Text as="div" size="2" mb="4">
				By SteveXMH
			</Text>
			<Text as="div" size="2" color="gray">
				构建日期：{BUILD_TIME}
			</Text>
			<Text as="div" size="2" color="gray">
				Git 提交：
				{GIT_COMMIT === "unknown" ? (
					"unknown"
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
				)}
			</Text>
		</>
	);
};
