import { submitToAMLLDBDialogAtom } from "$/states/dialogs.ts";
import {
	Callout,
	Checkbox,
	Dialog,
	Text,
	Flex,
	TextArea,
	TextField,
	RadioGroup,
	Button,
} from "@radix-ui/themes";
import { useAtom, useStore } from "jotai";
import { ErrorCircle16Regular, Info16Regular } from "@fluentui/react-icons";
import { memo, useState } from "react";
import { toast } from "react-toastify";
import { lyricLinesAtom } from "$/states/main";
import exportTTMLText from "$/utils/ttml-writer";

export const SubmitToAMLLDBDialog = memo(() => {
	const [dialogOpen, setDialogOpen] = useAtom(submitToAMLLDBDialogAtom);
	const [name, setName] = useState("");
	const [comment, setComment] = useState("");
	const [processing, setProcessing] = useState(false);
	const [submitReason, setSubmitReason] = useState("新歌词提交");
	const store = useStore();

	async function uploadAndSubmit() {
		if (processing) return;
		setProcessing(true);
		try {
			const ttmlLyric = store.get(lyricLinesAtom);
			const lyricData = encodeURIComponent(exportTTMLText(ttmlLyric));
			const lyricUrl = await fetch("https://dpaste.org/api/", {
				method: "POST",
				mode: "cors",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: `format=url&lexer=xml&expires=3600&filename=lyric.ttml&content=${lyricData}`,
			})
				.then((v) => {
					console.log(v);
					return v.text();
				})
				.then((v) => `${v.trim()}/raw`);
			const issueUrl = new URL(
				"https://github.com/Steve-xmh/amll-ttml-db/issues/new",
			);
			issueUrl.searchParams.append("labels", "歌词提交/补正");
			issueUrl.searchParams.append("template", "submit-lyric.yml");
			issueUrl.searchParams.append("title", `[歌词提交/修正] ${name}`);
			issueUrl.searchParams.append("song-name", name);
			issueUrl.searchParams.append("ttml-download-url", lyricUrl);
			issueUrl.searchParams.append("upload-reason", submitReason);
			issueUrl.searchParams.append("comment", comment);
			open(issueUrl.toString());
		} catch (err) {
			console.warn("Submit failed", err);
			// notify.error({
			// 	title: t("uploadDBDialog.errorNotification.title"),
			// 	content: t("uploadDBDialog.errorNotification.content", [err]),
			// });
			toast.error("提交发生错误，请查看控制台确认原因！");
		}
		setProcessing(false);
	}

	return (
		<Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
			<Dialog.Content>
				<Dialog.Title>
					提交歌词到 AMLL 歌词数据库（仅简体中文用户）
				</Dialog.Title>
				<Flex direction="column" gap="4">
					<Callout.Root color="orange">
						<Callout.Icon>
							<ErrorCircle16Regular />
						</Callout.Icon>
						<Callout.Text>
							本功能仅使用 AMLL
							歌词数据库的简体中文用户可用，如果您是为了在其他软件上使用歌词而编辑歌词的话，请参考对应的软件提交歌词的方式来提交歌词哦！
						</Callout.Text>
					</Callout.Root>
					<Callout.Root color="blue">
						<Callout.Icon>
							<Info16Regular />
						</Callout.Icon>
						<Callout.Text>
							<p>
								首先，感谢您的慷慨歌词贡献！
								<br />
								通过提交，你将默认同意{" "}
								<Text weight="bold" color="orange">
									使用 CC0 共享协议完全放弃歌词所有权{" "}
								</Text>
								并提交到歌词数据库！
								<br />
								并且歌词将会在以后被 AMLL 系程序作为默认 TTML 歌词源获取！
								<br />
								如果您对歌词所有权比较看重的话，请勿提交歌词哦！
								<br />
								请输入以下提交信息然后跳转到 Github 议题提交页面！
							</p>
						</Callout.Text>
					</Callout.Root>
					<Button variant="soft" size="1">
						关闭上述警告信息
					</Button>
					<Text as="label" size="2">
						<Flex gap="2">
							<Checkbox defaultChecked />
							从元数据中生成
						</Flex>
					</Text>
					<Text as="label" size="2">
						<Flex direction="column" gap="2">
							音乐名称
							<TextField.Root
								value={name}
								onChange={(e) => setName(e.currentTarget.value)}
							/>
							推荐使用 歌手 - 歌曲 格式，方便仓库管理员确认你的歌曲是否存在
						</Flex>
					</Text>
					<Text as="label" size="2">
						<Flex direction="column" gap="2">
							提交缘由
							<RadioGroup.Root
								value={submitReason}
								onValueChange={setSubmitReason}
							>
								<RadioGroup.Item value="新歌词提交">新歌词提交</RadioGroup.Item>
								<RadioGroup.Item value="修正已有歌词">
									修正已有歌词
								</RadioGroup.Item>
							</RadioGroup.Root>
						</Flex>
					</Text>
					<Text as="label" size="2">
						<Flex direction="column" gap="2">
							备注
							<TextArea
								resize="vertical"
								placeholder="有什么需要补充说明的呢？"
								value={comment}
								onChange={(e) => setComment(e.currentTarget.value)}
							/>
						</Flex>
					</Text>
					<Button loading={processing} onClick={uploadAndSubmit}>
						上传歌词并创建议题
					</Button>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
});
