import { ImportFromText } from "$/components/Dialogs/import-from-text.tsx";
import { MetadataEditor } from "$/components/Dialogs/metadata.tsx";
import { SettingsDialog } from "$/components/Dialogs/settings";
import { SubmitToAMLLDBDialog } from "$/components/Dialogs/submit-to-amll-db.tsx";
import { ConfirmationDialog } from "./confirmation.tsx";
import { LatencyTestDialog } from "./latency-test";
import { NoticeDialog } from "./notice.tsx";
import { SplitWordDialog } from "./split-word";

export const Dialogs = () => {
	return (
		<>
			<ImportFromText />
			<MetadataEditor />
			<SettingsDialog />
			<SplitWordDialog />
			<SubmitToAMLLDBDialog />
			<LatencyTestDialog />
			<NoticeDialog />
			<ConfirmationDialog />
		</>
	);
};

export default Dialogs;
