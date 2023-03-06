import { useAtomValue } from "jotai";
import { ExportTTMLPage } from "./pages/export-ttml";
import { FetchingLyricsPage } from "./pages/fetching-lyrics";
import { PairNCMSongsPage } from "./pages/pair-ncm-songs";
import { SelectSongsPage } from "./pages/select-songs";
import { UserMediaTokenPage } from "./pages/user-media-token";
import { UserPlaylistsPage } from "./pages/user-playlists";
import { currentPageAtom } from "./states";

function App() {
	const currentPage = useAtomValue(currentPageAtom);

	if (currentPage === "user-media-token") return <UserMediaTokenPage />;
	if (currentPage === "user-playlists") return <UserPlaylistsPage />;
	if (currentPage === "select-songs") return <SelectSongsPage />;
	if (currentPage === "fetching-lyrics") return <FetchingLyricsPage />;
	if (currentPage === "pair-ncm-songs") return <PairNCMSongsPage />;
	if (currentPage === "export-ttml") return <ExportTTMLPage />;

	return <></>;
}

export default App;
