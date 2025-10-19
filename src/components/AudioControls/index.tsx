/*
 * Copyright 2023-2025 Steve Xiao (stevexmh@qq.com) and contributors.
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
	audioPlayingAtom,
	currentDurationAtom,
	currentTimeAtom,
	playbackRateAtom,
	volumeAtom,
} from "$/states/audio.ts";
import {
	keyPlayPauseAtom,
	keyPlaybackRateDownAtom,
	keyPlaybackRateUpAtom,
	keySeekBackwardAtom,
	keySeekForwardAtom,
	keyVolumeDownAtom,
	keyVolumeUpAtom,
} from "$/states/keybindings.ts";
import { audioEngine } from "$/utils/audio";
import { useKeyBindingAtom } from "$/utils/keybindings.ts";
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
import { useAtom, useAtomValue, useStore } from "jotai";
import { type FC, memo, useCallback, useEffect, useState } from "react";

const AudioPlaybackKeyBinding = memo(() => {
	const store = useStore();

	useKeyBindingAtom(keyPlayPauseAtom, () => {
		if (audioEngine.musicPlaying) audioEngine.pauseMusic();
		else audioEngine.resumeOrSeekMusic();
	}, []);

	useKeyBindingAtom(keySeekForwardAtom, () => {
		audioEngine.seekMusic(
			Math.min(audioEngine.musicCurrentTime + 5, audioEngine.musicDuration),
		);
	}, []);

	useKeyBindingAtom(keySeekBackwardAtom, () => {
		audioEngine.seekMusic(Math.max(audioEngine.musicCurrentTime - 5, 0));
	}, []);

	useKeyBindingAtom(keyVolumeUpAtom, () => {
		store.set(volumeAtom, (v) => Math.min(1, v + 0.1));
	}, [store]);

	useKeyBindingAtom(keyVolumeDownAtom, () => {
		store.set(volumeAtom, (v) => Math.max(0, v - 0.1));
	}, [store]);

	useKeyBindingAtom(keyPlaybackRateUpAtom, () => {
		store.set(playbackRateAtom, (v) => Math.min(4, v + 0.25));
	}, [store]);

	useKeyBindingAtom(keyPlaybackRateDownAtom, () => {
		store.set(playbackRateAtom, (v) => Math.max(0.25, v - 0.25));
	}, [store]);

	return null;
});

export const AudioControls: FC = memo(() => {
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
				audioEngine.loadMusic(file);
			},
			{
				once: true,
			},
		);
		inputEl.click();
	}, []);

	const onTogglePlay = useCallback(() => {
		if (audioEngine.musicPlaying) {
			audioEngine.pauseMusic();
		} else {
			audioEngine.resumeOrSeekMusic();
		}
	}, []);

	useEffect(() => {
		const onMusicLoad = () => {
			setAudioLoaded(true);
			setAudioPlaying(false);
		};
		const onMusicUnload = () => {
			setAudioLoaded(false);
			setAudioPlaying(false);
		};
		const onMusicPause = () => {
			setAudioPlaying(false);
		};
		const onMusicResume = () => {
			setAudioPlaying(true);
		};
		const onVolumeChange = () => {
			setVolume(audioEngine.volume);
		};
		setAudioLoaded(audioEngine.musicLoaded);
		setAudioPlaying(audioEngine.musicPlaying);
		setVolume(audioEngine.volume);
		setPlaybackRate(audioEngine.musicPlayBackRate);
		audioEngine.addEventListener("music-load", onMusicLoad);
		audioEngine.addEventListener("music-unload", onMusicUnload);
		audioEngine.addEventListener("music-pause", onMusicPause);
		audioEngine.addEventListener("music-resume", onMusicResume);
		audioEngine.addEventListener("volume-change", onVolumeChange);
		return () => {
			audioEngine.removeEventListener("music-load", onMusicLoad);
			audioEngine.removeEventListener("music-unload", onMusicUnload);
			audioEngine.removeEventListener("music-pause", onMusicPause);
			audioEngine.removeEventListener("music-resume", onMusicResume);
			audioEngine.removeEventListener("volume-change", onVolumeChange);
		};
	}, [setAudioPlaying, setVolume, setPlaybackRate]);

	useEffect(() => {
		audioEngine.volume = volume;
	}, [volume]);

	useEffect(() => {
		audioEngine.musicPlayBackRate = playbackRate;
	}, [playbackRate]);

	return (
		<Card m="2" mt="0">
			<Inset>
				<AudioPlaybackKeyBinding />
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
										min={0.1}
										max={2}
										defaultValue={[playbackRate]}
										step={0.05}
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
