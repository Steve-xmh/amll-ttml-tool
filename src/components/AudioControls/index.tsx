/*
 * Copyright 2023-2023 Steve Xiao (stevexmh@qq.com) and contributors.
 *
 * 本源代码文件是属于 AMLL TTML Tool 项目的一部分。
 * This source code file is a part of AMLL TTML Tool project.
 * 本项目的源代码的使用受到 GNU GENERAL PUBLIC LICENSE version 3 许可证的约束，具体可以参阅以下链接。
 * Use of this source code is governed by the GNU GPLv3 license that can be found through the following link.
 *
 * https://github.com/Steve-xmh/amll-ttml-tool/blob/main/LICENSE
 */

import { AudioSlider } from "$/components/AudioControls/audio-slider.tsx";
import {
	audioElAtom,
	audioPlayingAtom,
	currentDurationAtom,
	currentTimeAtom,
	loadedAudioAtom,
	playbackRateAtom,
	volumeAtom,
} from "$/states/audio.ts";
import { msToTimestamp } from "$/utils/timestamp.ts";
import {
	MusicNote2Filled,
	PauseFilled,
	PlayFilled,
} from "@fluentui/react-icons";
import {
	Card,
	Flex,
	Grid,
	HoverCard,
	IconButton,
	Inset,
	Slider,
	Text,
	Tooltip,
} from "@radix-ui/themes";
import { useAtom, useAtomValue } from "jotai";
import { type FC, memo, useCallback, useEffect, useState } from "react";

export const AudioControls: FC = memo(() => {
	const audioEl = useAtomValue(audioElAtom);
	const [audio, setAudio] = useAtom(loadedAudioAtom);
	const [audioLoaded, setAudioLoaded] = useState(false);
	const currentTime = useAtomValue(currentTimeAtom);
	const currentDuration = useAtomValue(currentDurationAtom);
	const [audioPlaying, setAudioPlaying] = useAtom(audioPlayingAtom);
	const [volume, setVolume] = useAtom(volumeAtom);
	const [playbackRate, setPlaybackRate] = useAtom(playbackRateAtom);

	const onLoadMusic = useCallback(() => {
		const inputEl = document.createElement("input");
		inputEl.type = "file";
		inputEl.accept = "audio/*,*/*";
		inputEl.addEventListener(
			"change",
			() => {
				const file = inputEl.files?.[0];
				if (!file) return;

				console.log("Loading audio", file);
				setAudio(file);
			},
			{
				once: true,
			},
		);
		inputEl.click();
	}, [setAudio]);

	const onTogglePlay = useCallback(() => {
		if (audioEl.paused) audioEl.play();
		else audioEl.pause();
	}, [audioEl]);

	useEffect(() => {
		if (audio.size > 0) {
			const audioUrl = URL.createObjectURL(audio);
			audioEl.src = audioUrl;
			setAudioLoaded(true);
			setAudioPlaying(false);
			return () => {
				audioEl.src = "";
				URL.revokeObjectURL(audioUrl);
				setAudioLoaded(false);
				setAudioPlaying(false);
			};
		}
	}, [audioEl, audio, setAudioPlaying]);

	useEffect(() => {
		audioEl.volume = volume;
	}, [audioEl, volume]);

	useEffect(() => {
		audioEl.playbackRate = playbackRate;
	}, [audioEl, playbackRate]);

	return (
		<Card m="2" mt="0">
			<Inset>
				<Flex align="center" px="2" gapX="2">
					<HoverCard.Root>
						<HoverCard.Trigger>
							<IconButton my="2" variant="soft" onClick={onLoadMusic}>
								<MusicNote2Filled />
							</IconButton>
						</HoverCard.Trigger>
						<HoverCard.Content>
							<Flex direction="column" align="center">
								<Grid columns="0fr 7em 2em" gap="2" align="baseline">
									<Text wrap="nowrap">音量</Text>
									<Slider
										min={0}
										max={1}
										defaultValue={[volume]}
										step={0.01}
										onValueChange={(v) => setVolume(v[0])}
									/>
									<Text wrap="nowrap" color="gray" size="1">
										{(volume * 100).toFixed()}%
									</Text>
									<Text wrap="nowrap">播放速度</Text>
									<Slider
										min={0.25}
										max={4}
										defaultValue={[playbackRate]}
										step={0.25}
										onValueChange={(v) => setPlaybackRate(v[0])}
									/>
									<Text wrap="nowrap" color="gray" size="1">
										{playbackRate.toFixed(2)}x
									</Text>
								</Grid>
								<Text wrap="nowrap" align="center" mt="2" size="1" color="gray">
									点击图标按钮以加载音乐
								</Text>
							</Flex>
						</HoverCard.Content>
					</HoverCard.Root>
					<Tooltip content="暂停 / 播放音乐">
						<IconButton
							my="2"
							ml="0"
							variant="soft"
							disabled={!audioLoaded}
							onClick={onTogglePlay}
						>
							{audioPlaying ? <PauseFilled /> : <PlayFilled />}
						</IconButton>
					</Tooltip>
					<Text
						size="2"
						style={{
							minWidth: "5.5em",
							textAlign: "left",
						}}
					>
						{msToTimestamp(currentTime)}
					</Text>
					<AudioSlider />
					<Text
						size="2"
						style={{
							minWidth: "5.5em",
						}}
					>
						{msToTimestamp(currentDuration)}
					</Text>
				</Flex>
			</Inset>
		</Card>
	);
});

export default AudioControls;
