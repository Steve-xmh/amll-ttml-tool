import { useTranslation } from "react-i18next";
import type { ProjectIdentity } from "$/utils/project-info";

/**
 * @description 用于将 ProjectIdentity 转换为当前语言的显示字符串
 */
export function useProjectDisplayName() {
	const { t } = useTranslation();

	const getDisplayName = (identity: ProjectIdentity | undefined | null) => {
		if (!identity) return "";

		if (identity.isUntitled) {
			return t("autosave.untitledProjectName", "未命名项目");
		}

		return identity.displayName;
	};

	return { getDisplayName };
}
