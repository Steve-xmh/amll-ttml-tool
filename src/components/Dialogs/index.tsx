import { ImportFromText } from "$/components/Dialogs/import-from-text.tsx";
import { MetadataEditor } from "$/components/Dialogs/metadata.tsx";

export const Dialogs = () => {
	return (
		<>
			<ImportFromText />
			<MetadataEditor />
		</>
	);
};

export default Dialogs;
