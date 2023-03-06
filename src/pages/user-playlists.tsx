import { useSetAtom } from "jotai";
import { useLayoutEffect, useState } from "react";
import { GroupBox } from "../components/appkit/group-box";
import { Spinner } from "../components/appkit/spinner";
import { currentPageAtom, selectedPlaylistAtom } from "../states";
import { globalAMAPI, PlaylistResource } from "../utils/am-api";

export const PlaylistItem: React.FC<{ playlist: PlaylistResource }> = (
	props,
) => {
	const setCurrentPage = useSetAtom(currentPageAtom);
	const setSelectedPlaylist = useSetAtom(selectedPlaylistAtom);

	return (
		<div
			className="user-playlist-item"
			onClick={() => {
				setSelectedPlaylist(props.playlist);
				setCurrentPage("select-songs");
			}}
			onKeyUp={() => {}}
		>
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path d="M13.079 19.712c1.076 0 2.688-.79 2.688-2.922v-6.702c0-.388.073-.468.417-.542l3.347-.732a.48.48 0 0 0 .403-.483V5.577c0-.388-.315-.637-.688-.564l-3.765.82c-.469.103-.725.359-.725.77l.015 8.144c.036.359-.132.593-.455.659l-1.164.242c-1.465.307-2.153 1.054-2.153 2.16 0 1.12.864 1.904 2.08 1.904zM12.046 8.675a.503.503 0 0 0 .498-.498.497.497 0 0 0-.498-.49H5.498a.492.492 0 0 0-.498.49.5.5 0 0 0 .498.498h6.548zm0 2.607a.5.5 0 0 0 .498-.505.49.49 0 0 0-.498-.483H5.498a.486.486 0 0 0-.498.483c0 .278.212.505.498.505h6.548zm0 2.608a.494.494 0 1 0 0-.989H5.498a.492.492 0 0 0-.498.49.49.49 0 0 0 .498.499h6.548z" />
			</svg>
			<div>{props.playlist.attributes.name}</div>
		</div>
	);
};

export const UserPlaylistsPage: React.FC = () => {
	const [playlists, setPlaylists] = useState<PlaylistResource[] | null>(null);

	useLayoutEffect(() => {
		(async () => {
			const playlists = await globalAMAPI.getAllPlaylists();
			const result = playlists.data.map(
				(v) => playlists.resources["library-playlists"][v.id],
			);
			console.log(playlists);
			setPlaylists(result);
		})();
	}, []);

	return (
		<div className="user-playlists-container">
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					fontSize: "24px",
					padding: "5vh",
				}}
			>
				<div>选择一个需要导出歌词的播放列表 (2/6)</div>
			</div>
			{playlists ? (
				<div className="user-playlists-list">
					<div>
						<div>
							{playlists.map((v) => (
								<PlaylistItem key={v.id} playlist={v} />
							))}
						</div>
					</div>
				</div>
			) : (
				<div
					style={{
						flex: "1",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Spinner />
					正在加载播放列表
				</div>
			)}
		</div>
	);
};
