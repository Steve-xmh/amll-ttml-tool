import { useAtomValue, useSetAtom } from "jotai";
import { useLayoutEffect, useMemo, useState } from "react";
import { Button } from "../components/appkit/button";
import { Spinner } from "../components/appkit/spinner";
import { TextField } from "../components/appkit/text-field";
import iconChecked from "../components/appkit/icons/checked.svg?url";
import { currentPageAtom, pairSongsAtom, SongPairData } from "../states";
import { classname } from "../utils";
import { getNCMLyric } from "../utils/ncm-api";
import { LyricLine } from "../utils/lyric-types";
import { mixinLyric, parsePureLyric } from "../utils/lyric-parser";

const numberReg = /^([0-9]+)$/;

export const SongItem: React.FC<{
	song: SongPairData;
}> = (props) => {
	const imgSize = useMemo(() => Math.ceil(64 * window.devicePixelRatio), []);
	const imgUrl = props.song.attributes?.artwork?.url
		? props.song.attributes.artwork.url
				.replace(/\{(w|h)\}/g, imgSize.toString())
				.replace("{f}", "webp")
		: "";
	const [checking, setChecking] = useState("");
	const [ncmID, setNCMID] = useState("");

	useLayoutEffect(() => {
		if (ncmID.trim().length === 0) {
			setChecking("");
			props.song.mixinLyric = JSON.parse(
				JSON.stringify(props.song.lyric),
			) as LyricLine[];
			return;
		}
		let canceled = false;
		setChecking("checking");
		// https://music.163.com/song?id=1962165898
		let id = ncmID.trim();

		try {
			const url = new URL(id);
			const paramId = url.searchParams.get("id");
			if (paramId) {
				id = paramId;
			}
		} catch {}

		if (!numberReg.test(id)) {
			setChecking("wrong-id");
			return;
		}
		(async () => {
			try {
				const lyricData = await getNCMLyric(id);
				if (canceled) return;
				if (lyricData.error) {
					setChecking(`error-${lyricData.error}`);
					return;
				}
				if (!(lyricData.tlyric || lyricData.romalrc)) {
					setChecking(`error-${lyricData.error}`);
					return;
				}
				const cloned = JSON.parse(
					JSON.stringify(props.song.lyric),
				) as LyricLine[];
				if (lyricData.tlyric?.lyric)
					mixinLyric(
						cloned,
						parsePureLyric(lyricData.tlyric.lyric),
						"translation",
					);
				if (lyricData.romalrc?.lyric)
					mixinLyric(cloned, parsePureLyric(lyricData.romalrc.lyric), "roman");
				console.log("???????????????", cloned);
				props.song.ncmID = id;
				props.song.mixinLyric = cloned;
				setChecking("ok");
			} catch (err) {
				console.warn(err);
			}
		})();
		return () => {
			canceled = true;
		};
	}, [ncmID, props.song]);

	return (
		<div
			className={classname("song-item", {
				disabled: !props.song.attributes.hasLyrics,
			})}
		>
			{imgUrl.length > 0 && <img width={64} height={64} src={imgUrl} alt="" />}
			<div className="name">
				{props.song.attributes.artistName} - {props.song.attributes.name}
			</div>
			{checking === "checking" && <Spinner />}
			{checking === "ok" && <img src={iconChecked} alt="" />}
			{checking === "wrong-id" && <div>?????? ID ????????????</div>}
			{checking === "not-found" && <div>?????????????????????</div>}
			<TextField
				value={ncmID}
				onChange={(evt) => setNCMID((evt.target as HTMLInputElement).value)}
			/>
		</div>
	);
};

export const PairNCMSongsPage: React.FC = () => {
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
				<div>???????????? (5/6)</div>
			</div>
			<div
				style={{
					textAlign: "center",
				}}
			>
				?????????????????????????????????????????? ID
				?????????????????????????????????????????????????????????/????????????
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
					?????????
				</Button>
				<Button accent onClick={() => setCurrentPage("export-ttml")}>
					??????
				</Button>
			</div>
		</div>
	);
};
