import { atomWithKeybindingStorage } from "$/utils/keybindings";
import type { I18nKey, KeyBindingCommand, KeyBindingsConfig } from "./types";

/**
 * 存储所有注册的命令
 *
 * @internal
 */
const commandsMap = new Map<string, KeyBindingCommand>();

/**
 * 注册一个快捷键命令
 * @param id 唯一 ID (例如 "file.save")
 * @param defaultKeys 默认按键 (例如 ["Control", "KeyS"])
 * @param description i18n key
 * @param category 分类 (例如 "File")
 */
export function registerCommand(
	id: string,
	defaultKeys: KeyBindingsConfig,
	description: I18nKey,
	category = "General",
) {
	const commandAtom = atomWithKeybindingStorage(id, defaultKeys);

	const command: KeyBindingCommand = {
		id,
		defaultKeys,
		description,
		category,
		atom: commandAtom,
	};

	if (commandsMap.has(id)) {
		console.warn(`[Keyboard] Duplicate command registered: ${id}`);
	}
	commandsMap.set(id, command);

	return command;
}

export function getAllCommands(): KeyBindingCommand[] {
	return Array.from(commandsMap.values());
}

export function getCommandById(id: string): KeyBindingCommand | undefined {
	return commandsMap.get(id);
}
