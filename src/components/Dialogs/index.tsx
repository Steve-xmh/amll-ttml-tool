import { ImportFromText } from "$/components/Dialogs/import-from-text.tsx";
import { MetadataEditor } from "$/components/Dialogs/metadata.tsx";
import { SettingsDialog } from "$/components/Dialogs/settings";
import { SubmitToAMLLDBDialog } from "$/components/Dialogs/submit-to-amll-db.tsx";
import { AdvancedSegmentationDialog } from "$/modules/segmentation/components/AdvancedSegmentation.tsx";
import { SplitWordDialog } from "$/modules/segmentation/components/split-word.tsx";
import { LatencyTestDialog } from "../../modules/audio/modals/LatencyTest.tsx";
import { ConfirmationDialog } from "./confirmation.tsx";
import { HistoryRestoreDialog } from "./HistoryRestore.tsx";
import { NoticeDialog } from "./notice.tsx";
import { TimeShiftDialog } from "./TimeShift.tsx";

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
			<HistoryRestoreDialog />
			<AdvancedSegmentationDialog />
			<TimeShiftDialog />
		</>
	);
};

export default Dialogs;
