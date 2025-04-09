import { latencyTestBPMAtom } from "$/states/config";
import { latencyTestDialogAtom } from "$/states/dialogs.ts";
import { keySyncNextAtom } from "$/states/keybindings";
import { audioEngine } from "$/utils/audio";
import { useKeyBindingAtom } from "$/utils/keybindings";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { memo, useEffect, useRef, useState } from "react";

const BeepVisualizer = ({
	enable,
}: {
	enable: boolean;
}) => {
	return (
		<div
			style={{
				width: "2em",
				height: "2em",
				borderRadius: "50%",
				boxShadow: "var(--shadow-2)",
				backgroundColor: enable ? "var(--accent-11)" : "var(--accent-a5)",
			}}
		/>
	);
};

export const LatencyTestDialog = memo(() => {
	const [dialogOpen, setDialogOpen] = useAtom(latencyTestDialogAtom);
	const [latencyBPM, setLatencyBPM] = useAtom(latencyTestBPMAtom);
	const [start, setStart] = useState(false);
	const [curBeat, setCurBeat] = useState(-1);
	const [hitOffset, setHitOffset] = useState<number | null>(null);
	const nextBeatTime = useRef(0);
	const curBeatTime = useRef(0);
	const beepDuration = 1000 / (latencyBPM / 60);

	useEffect(() => {
		if (!start || !dialogOpen) {
			setCurBeat(-1);
			return;
		}
		let canceled = false;

		(async () => {
			const beep1 = () => {
				const node = audioEngine.ctx.createOscillator();
				node.type = "sine";
				node.frequency.value = 880;
				return node;
			};
			const beep2 = () => {
				const node = audioEngine.ctx.createOscillator();
				node.type = "sine";
				node.frequency.value = 440;
				return node;
			};

			let beat = 0;
			const dur = beepDuration / 1000;
			const nodeDur = 0.05;

			curBeatTime.current = audioEngine.ctxCurrentTime;
			nextBeatTime.current = curBeatTime.current;
			audioEngine.playNode(
				beep1(),
				curBeatTime.current,
				curBeatTime.current + nodeDur,
			);
			setCurBeat(0);

			let curNode: AudioScheduledSourceNode | null = null;

			while (!canceled) {
				const currentTime = audioEngine.ctxCurrentTime;
				if (currentTime >= nextBeatTime.current) {
					setCurBeat(beat);
					curNode = ++beat % 4 === 0 ? beep1() : beep2();
					beat %= 4;
					curBeatTime.current = currentTime;
					nextBeatTime.current = currentTime + dur;
					audioEngine.playNode(
						curNode,
						nextBeatTime.current,
						nextBeatTime.current + nodeDur,
					);
				}
				await new Promise((r) => requestAnimationFrame(r));
			}

			curNode?.stop();
		})();

		return () => {
			canceled = true;
		};
	}, [start, dialogOpen, beepDuration]);

	useKeyBindingAtom(
		keySyncNextAtom,
		(evt) => {
			if (!start) return;
			const hitTime =
				audioEngine.ctxCurrentTime -
				evt.downTimeOffset / 1000 -
				audioEngine.ctxOutputLatency;
			const curDiff = curBeatTime.current - hitTime;
			const nextDiff = nextBeatTime.current - hitTime;
			let diff = 0;
			if (Math.abs(curDiff) < Math.abs(nextDiff)) {
				diff = curDiff;
			} else {
				diff = nextDiff;
			}
			// 正值为快，负值为慢
			setHitOffset((diff * 1000) | 0);
		},
		[start],
	);

	return (
		<Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
			<Dialog.Content>
				<Dialog.Title>打轴延迟测试</Dialog.Title>
				<Flex direction="column" gap="2">
					<Text>
						请选择自己喜欢的
						BPM，并在每个蜂鸣声响起时按下打轴按键，以测量音频/输入延迟差
					</Text>

					<Flex
						gap="6"
						my="6"
						style={{
							alignSelf: "center",
						}}
					>
						<BeepVisualizer enable={curBeat === 0} />
						<BeepVisualizer enable={curBeat === 1} />
						<BeepVisualizer enable={curBeat === 2} />
						<BeepVisualizer enable={curBeat === 3} />
					</Flex>
					<Flex
						style={{
							alignSelf: "center",
						}}
					>
						<Text
							color={
								hitOffset === null
									? "gray"
									: hitOffset > 0
										? "blue"
										: hitOffset < 0
											? "red"
											: "green"
							}
						>
							{hitOffset === null
								? "未测量"
								: hitOffset > 0
									? `快 ${hitOffset}ms`
									: hitOffset < 0
										? `慢 ${hitOffset}ms`
										: "完美 0ms"}
						</Text>
					</Flex>

					<Text as="label" size="2">
						<Flex direction="column" gap="2">
							节拍 BPM
							<TextField.Root
								type="number"
								min={60}
								max={320}
								value={latencyBPM}
								onChange={(evt) => setLatencyBPM(evt.target.valueAsNumber)}
							/>
						</Flex>
					</Text>

					<Flex gap="2">
						<Button onClick={() => setStart((v) => !v)}>
							{start ? "结束" : "开始"}
						</Button>
					</Flex>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
});
