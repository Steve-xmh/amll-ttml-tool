import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { Button } from "../components/appkit/button";
import { currentPageAtom, pairSongsAtom, SongPairData } from "../states";
import { writeText } from "@tauri-apps/api/clipboard";
import { writeFile } from "@tauri-apps/api/fs";
import { save, open } from "@tauri-apps/api/dialog";
import { open as shellOpen } from "@tauri-apps/api/shell";
import exportTTMLText from "../utils/ttml-writer";

export const SongItem: React.FC<{
	song: SongPairData;
}> = (props) => {
	const imgSize = useMemo(() => Math.ceil(64 * window.devicePixelRatio), []);
	const imgUrl = props.song.attributes?.artwork?.url
		? props.song.attributes.artwork.url
				.replace(/\{(w|h)\}/g, imgSize.toString())
				.replace("{f}", "webp")
		: "";

	return (
		<div className="song-item">
			{imgUrl.length > 0 && <img width={64} height={64} src={imgUrl} alt="" />}
			<div className="name">
				{props.song.attributes.artistName} - {props.song.attributes.name}
			</div>
			<Button style={{ marginRight: "8px" }}>保存到文件</Button>
			<Button
				onClick={() => {
					const text = exportTTMLText(props.song.mixinLyric);
					writeText(text);
				}}
			>
				复制到剪切板
			</Button>
		</div>
	);
};

export const ExportTTMLPage: React.FC = () => {
	const pairSongs = useAtomValue(pairSongsAtom);
	const setCurrentPage = useSetAtom(currentPageAtom);

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
				<div>导出歌词 (6/6)</div>
			</div>
			<div
				style={{
					textAlign: "center",
				}}
			>
				就快完成了！请选择需要导出的歌词并保存为 TTML 格式吧！
				<div />
				自动合并歌词可能会因为歌词时间轴的误差导致合并结果略有问题，如果遇到这个问题，可以考虑自行修正歌词文件。
				<div />
				你也可以直接导出到文件夹，指定为 BetterNCM 插件文件夹下的{" "}
				<code>amll-data/ttml-lyrics</code> 文件夹，即可快速使用生成的歌词了！
				<div />
				同时，你也可以来提交合并后的歌词到 Github
				的歌词仓库，一起丰富歌词数据库哦！
			</div>
			<div className="user-playlists-list">
				<div>
					<div>
						{pairSongs.map((v) => (
							<SongItem key={v.id} song={v} />
						))}
					</div>
				</div>
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
				<Button
					accent
					style={{ marginRight: "8px" }}
					onClick={async () => {
						const dir = await open({
							title: "选择需要导出到的文件夹...",
							directory: true,
						});
						if (typeof dir === "string") {
							console.log(dir);
							await Promise.all(
								pairSongs.map(async (song) => {
									const dest = `${dir}/${song.ncmID}.ttml`;
									console.log("正在写出到", dest);
									await writeFile(dest, exportTTMLText(song.mixinLyric));
								}),
							);
						}
					}}
				>
					导出到文件夹
				</Button>
				<Button
					onClick={() => {
						shellOpen("https://github.com/Steve-xmh/amll-ttml-db");
					}}
				>
					我想提交到 Github 歌词数据库
				</Button>
			</div>
		</div>
	);
};
