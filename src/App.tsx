import { useAtomValue } from "jotai";
import { UserMediaTokenPage } from "./pages/user-media-token";
import { UserPlaylistsPage } from "./pages/user-playlists";
import { currentPageAtom } from "./states";

function App() {
	const currentPage = useAtomValue(currentPageAtom);

	if (currentPage === "user-media-token") return <UserMediaTokenPage />;
	if (currentPage === "user-playlists") return <UserPlaylistsPage />;

	return <></>;
}

export default App;
