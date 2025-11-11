import { Flex, Switch, Text } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { enablePerWordRomanizationAtom } from "$/states/config.ts";

export const SettingsExperimentalTab = () => {
	const { t } = useTranslation();
	const [enablePerWordRomanization, setEnablePerWordRomanization] = useAtom(
		enablePerWordRomanizationAtom,
	);

	return (
		<Text as="label">
			<Flex direction="column" gap="2" my="3" align="start">
				<Flex gap="2" align="center" justify="between">
					<Text>
						{t("settings.experimental.perWordRomanization", "启用逐字音译")}
					</Text>
					<Switch
						checked={enablePerWordRomanization}
						onCheckedChange={setEnablePerWordRomanization}
					/>
				</Flex>
			</Flex>
		</Text>
	);
};
