/**
 * AMLL TTML Tool 跨域通信协议
 *
 * 此接口允许你从任意网站发送 `postMessage` 来触发 AMLL TTML Tool 打开一个项目
 *
 * ## 示例
 *
 * ```typescript
 * const message: ToolPostMessage = {
 *   type: "OPEN_PROJECT",
 *   payload: {
 *     audio: {
 *       url: "https://example.com/song.mp3",
 *       metadata: {
 *         title: "Example Song",
 *         artist: "Artist Name",
 *         duration: 180
 *       }
 *     },
 *     lyrics: {
 *       content: "[00:00.00]Hello World",
 *       format: "lrc"
 *     }
 *   }
 * };
 *
 * targetWindow.postMessage(message, "*");
 * ```
 */
export type ToolPostMessageProtocol =
	| ToolPostMessage
	| EditorReady
	| LoadResult;

export interface ToolPostMessage {
	/**
	 * 消息类型
	 *
	 * 必须为 `OPEN_PROJECT`，否则无法加载你的数据
	 */
	type: "OPEN_PROJECT";

	/**
	 * 包含音频 和/或 歌词数据的载荷
	 */
	payload: {
		/**
		 * 音频数据配置
		 *
		 * 可选，如果不提供则只加载歌词
		 */
		audio?: {
			/**
			 * 要加载的音频文件的 URL
			 *
			 * - 如果提供了 `blob`，则忽略此字段并使用 blob
			 * - 如果没有 `blob`，Tool 将尝试通过 GET 请求从此 URL 获取音频数据
			 * - 确保 URL 可访问，如果需要跨域，确保你已经配置好了 CORS
			 */
			url?: string;

			/**
			 * 要加载的音频文件的 Blob 对象
			 *
			 * - 高优先级，如果提供则会直接加载它并跳过 URL
			 * - 适用于你已经有了音频数据的情况，比如从用户提供的文件中获得
			 */
			blob?: Blob;

			/**
			 * 音频文件的元数据
			 */
			metadata?: {
				title?: string;
				artist?: string;
				album?: string;
				duration?: number;
				[key: string]: unknown;
			};
		};

		/**
		 * 歌词数据
		 *
		 * 可选，如果不提供则只加载音频
		 */
		lyrics?: {
			/**
			 * 歌词文件的完整内容
			 */
			content: string;

			/**
			 * 歌词文件的格式
			 *
			 * - 支持的格式: `"lrc"`, `"ttml"`, `"qrc"`, `"yrc"`, `"eslrc"`, `"lys"`.
			 * - 如果不提供，则按照 TTML 格式来解析
			 */
			format?: "lrc" | "ttml" | "qrc" | "yrc" | "eslrc" | "lys";
		};
	};
}

/**
 * 编辑器初始化完毕，准备接收消息时发送的信息
 *
 * 只有在从一个页面中打开 Tool 时才会发送消息给这个页面，你应该等待这个消息然后再发送 `OPEN_PROJECT` 消息
 */
export interface EditorReady {
	type: "TOOL_READY";
	payload?: never;
}

/**
 * 加载结果反馈
 *
 * 由 Tool 发送给源网站
 */
export type LoadResult =
	| { type: "LOAD_SUCCESS" }
	| { type: "LOAD_ERROR"; payload: { message: string } }
	| { type: "LOAD_CANCELLED" };
