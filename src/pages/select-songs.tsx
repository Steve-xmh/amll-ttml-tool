import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Button } from "../components/appkit/button";
import { GroupBox } from "../components/appkit/group-box";
import { Spinner } from "../components/appkit/spinner";
import { Switch } from "../components/appkit/switch";
import {
	currentPageAtom,
	selectedPlaylistAtom,
	selectedSongsAtom,
} from "../states";
import { classname } from "../utils";
import { globalAMAPI, PlaylistSong } from "../utils/am-api";
import iconChecked from "../components/appkit/icons/checked.svg?url";

type SongData = PlaylistSong & { selected: boolean };

export const SongItem: React.FC<{
	song: SongData;
	onToggleSelect?: (song: SongData) => void;
}> = (props) => {
	const imgSize = useMemo(() => Math.ceil(64 * window.devicePixelRatio), []);
	const imgUrl = props.song.attributes?.artwork?.url
		? props.song.attributes.artwork.url
				.replace(/\{(w|h)\}/g, imgSize.toString())
				.replace("{f}", "webp")
		: "";
	return (
		<div
			className={classname("song-item", {
				disabled: !props.song.attributes.hasLyrics,
			})}
			onClick={() => props.onToggleSelect?.(props.song)}
			onKeyUp={() => {}}
		>
			{imgUrl.length > 0 && <img width={64} height={64} src={imgUrl} alt="" />}
			<div className="name">
				{props.song.attributes.artistName} - {props.song.attributes.name}
			</div>
			<div className="tag">
				{props.song.attributes.hasLyrics ? (
					props.song.selected ? (
						<img src={iconChecked} alt="" />
					) : (
						""
					)
				) : (
					"没有歌词"
				)}
			</div>
		</div>
	);
};

export const SelectSongsPage: React.FC = () => {
	const [songs, setSongs] = useState<SongData[] | null>(null);
	const [hideNoLyricSongs, setHideNoLyricSongs] = useState(true);
	const playlist = useAtomValue(selectedPlaylistAtom);
	const setCurrentPage = useSetAtom(currentPageAtom);
	const setSelectedSongs = useSetAtom(selectedSongsAtom);

	useLayoutEffect(() => {
		(async () => {
			setSongs(null);
			if (playlist) {
				const songs = await globalAMAPI.getPlaylist(playlist.id);
				console.log(songs);
				setSongs(
					Object.values(songs.resources["library-songs"])
						.map((v) => ({
							...v,
							selected: v.attributes.hasLyrics,
						}))
						.sort((a, b) => (a.id > b.id ? -1 : 1)),
				);
			}
		})();
	}, [playlist]);

	const displaySongs = useMemo(
		() =>
			hideNoLyricSongs ? songs?.filter((v) => v.attributes.hasLyrics) : songs,
		[hideNoLyricSongs, songs],
	);

	const onToggleSong = useCallback(
		(targetSong: SongData) => {
			if (songs) {
				targetSong.selected = !targetSong.selected;

				setSongs([...songs]);
			}
		},
		[songs],
	);

	return (
		<div className="select-songs-container">
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
				<div>选择需要导出歌词的歌曲 (3/6)</div>
			</div>
			<GroupBox className="select-songs-option" style={{ margin: "0 5vh" }}>
				<Switch
					selected={hideNoLyricSongs}
					onClick={() => setHideNoLyricSongs(!hideNoLyricSongs)}
					beforeSwitch={<div>隐藏没有歌词的歌曲</div>}
				/>
			</GroupBox>
			{displaySongs ? (
				<div className="user-playlists-list">
					<div>
						<div>
							{displaySongs.map((v) => (
								<SongItem onToggleSelect={onToggleSong} key={v.id} song={v} />
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
					正在加载歌曲列表
				</div>
			)}
			<div
				style={{
					margin: "0 5vh 5vh 5vh",
					display: "flex",
					justifyContent: "center",
				}}
			>
				<Button
					style={{ marginRight: "8px" }}
					onClick={() => setCurrentPage("user-playlists")}
				>
					上一步
				</Button>
				<Button
					style={{ marginRight: "8px" }}
					onClick={() =>
						setSongs((v) => {
							if (v)
								return v.map((v) => {
									v.selected = v.attributes.hasLyrics;
									return v;
								});
							else return null;
						})
					}
				>
					全选
				</Button>
				<Button
					style={{ marginRight: "8px" }}
					onClick={() =>
						setSongs((v) => {
							if (v)
								return v.map((v) => {
									v.selected = false;
									return v;
								});
							else return null;
						})
					}
				>
					全不选
				</Button>
				<Button
					accent
					onClick={() => {
						const selectedSongs =
							songs?.filter((v) => v.selected && v.attributes.hasLyrics) || [];
						if (selectedSongs.length > 0) {
							setSelectedSongs(selectedSongs);
							setCurrentPage("fetching-lyrics");
						}
					}}
				>
					获取所选歌曲歌词
				</Button>
			</div>
		</div>
	);
};
