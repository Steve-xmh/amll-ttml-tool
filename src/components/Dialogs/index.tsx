import { ImportFromText } from "$/components/Dialogs/import-from-text.tsx";
import { MetadataEditor } from "$/components/Dialogs/metadata.tsx";
import { SettingsDialog } from "$/components/Dialogs/settings";
import { SplitWordDialog } from "./split-word";

export const Dialogs = () => {
	return (
		<>
			<ImportFromText />
			<MetadataEditor />
			<SettingsDialog />
			<SplitWordDialog />
		</>
	);
};

export default Dialogs;
