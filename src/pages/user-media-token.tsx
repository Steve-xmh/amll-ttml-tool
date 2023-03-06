import { Button } from "../components/appkit/button";
import { TextField } from "../components/appkit/text-field";
import { Spinner } from "../components/appkit/spinner";
import { globalAMAPI } from "../utils/am-api";
import { useCallback, useLayoutEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { currentPageAtom } from "../states";

export const UserMediaTokenPage: React.FC = () => {
	const [mediaToken, setMediaToken] = useState(globalAMAPI.mediaUserToken);
	const [logining, setLogining] = useState(false);
	const [error, setError] = useState("");
	const setCurrentPage = useSetAtom(currentPageAtom);

	const login = useCallback(async () => {
		setLogining(true);
		setError("");

		try {
			globalAMAPI.mediaUserToken = mediaToken;
			await globalAMAPI.login();
			setCurrentPage("user-playlists");
		} catch (err) {
			setError(String(err));
		}

		setLogining(false);
	}, [mediaToken]);

	useLayoutEffect(() => {
		if (globalAMAPI.mediaUserToken.length > 0) {
			login();
		}
	}, [login]);

	return (
		<div className="user-media-token-container">
			<div
				style={{
					flex: "1",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					fontSize: "24px",
				}}
			>
				<div>初始化 Apple Music API (1/3)</div>
			</div>
			<div style={{ marginBottom: "14px" }}>
				请输入来自 Web 版 Apple Music 的用户媒体令牌：
			</div>
			<TextField
				type="password"
				placeholder="用户媒体令牌"
				value={mediaToken}
				onChange={(evt) =>
					setMediaToken((evt.target as HTMLInputElement).value)
				}
				style={{
					marginBottom: "14px",
				}}
			/>
			{logining && <Spinner />}
			{error.length > 0 && (
				<div style={{ marginBottom: "13px" }} className="appkit-alert error">
					登录失败：{error}
				</div>
			)}
			{!logining && (
				<div>
					<Button accent onClick={login}>
						登录
					</Button>
				</div>
			)}
			<div style={{ flex: "1" }} />
		</div>
	);
};
