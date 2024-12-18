export const audio = document.createElement("audio");

export const loadAudio = (src: typeof audio.src): Promise<void> => {
	audio.src = src;
	return new Promise((resolve, reject) => {
		const onLoad = () => {
			resolve();
			audio.removeEventListener("error", onError);
		};
		const onError = () => {
			reject();
			audio.removeEventListener("load", onLoad);
		}
		audio.addEventListener("load", onLoad, {once: true});
		audio.addEventListener("error", onError, {once: true});
	});
}
