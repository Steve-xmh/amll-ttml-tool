import { useAtomValue, useSetAtom } from "jotai";
import { useLayoutEffect, useState } from "react";
import { Button } from "../components/appkit/button";
import { Spinner } from "../components/appkit/spinner";
import { currentPageAtom, pairSongsAtom, selectedSongsAtom, SongPairData } from "../states";
import { globalAMAPI } from "../utils/am-api";
import { parseLyric } from "../utils/ttml-lyric-parser";

export const FetchingLyricsPage: React.FC = () => {
	const songs = useAtomValue(selectedSongsAtom);
	const setCurrentPage = useSetAtom(currentPageAtom);
	const setPairSongs = useSetAtom(pairSongsAtom);
	const [loaded, setLoaded] = useState(0);

	useLayoutEffect(() => {
		let canceled = false;
		(async () => {
			setLoaded(0);
			try {
				const result = (
					await Promise.all(
						songs.map(async (v) => {
							try {
								const lyricData = await globalAMAPI.getLyric(
									v.attributes.playParams.catalogId,
								);
								if (canceled) return;
								const lyric = parseLyric(lyricData.data[0].attributes.ttml);
								if (lyric.length === 0) {
									throw new TypeError(
										"解析到了空白歌词，可能是因为原歌词不是滚动歌词或逐词歌词",
									);
								}
								console.log("成功获取", v.attributes.name, "的歌词", lyric);
								setLoaded((v) => v + 1);
								return {
									...v,
									ncmID: "",
									lyric,
								};
							} catch (err) {
								console.warn("警告：歌词获取失败", err);
								setLoaded((v) => v + 1);
							}
						}),
					)
				).filter((v) => !!v) as SongPairData[];
				if (canceled) return;
                setPairSongs(result);
                setCurrentPage("pair-ncm-songs")
			} catch {}
		})();
		return () => {
			canceled = true;
		};
	}, [songs]);

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
				<div>正在下载歌词 (4/6)</div>
			</div>
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
				正在获取歌词
				<div />({loaded}/{songs.length})
				<div />
				完成后将自动进行下一步
			</div>
			<div
				style={{
					margin: "0 5vh 5vh 5vh",
					display: "flex",
					justifyContent: "center",
				}}
			>
				<Button
					style={{ marginRight: "8px" }}
					onClick={() => setCurrentPage("select-songs")}
				>
					上一步
				</Button>
			</div>
		</div>
	);
};
