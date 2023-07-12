import { compress } from "fflate";
import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import { resolve, dirname } from "path/posix";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Compresses the given data using the inflate function.
 *
 * @param {Uint8Array} data - The data to be compressed.
 * @return {Promise<Uint8Array>} A promise that resolves to the compressed data.
 */
const compressData = (data) =>
	new Promise((resolve, reject) =>
		compress(
			data,
			{
				consume: true,
                level: 9,
                mem: 12,
			},
			(err, result) => (err ? reject(err) : resolve(result)),
		),
	);

async function main() {
	const sourceDir = resolve(__dirname, "./public/kuromoji-dict");
	const destDir = resolve(__dirname, "./public/kuromoji-dict-min");
	const files = await readdir(sourceDir);
	await mkdir(destDir, { recursive: true });
	await Promise.all(
		files.map(async (file) => {
			const sourcePath = resolve(sourceDir, file);
			const destPath = resolve(destDir, file);
			const content = await readFile(sourcePath);
			const result = await compressData(new Uint8Array(content));
			await writeFile(destPath, result, {
				encoding: "binary",
			});
		}),
	);
}

main();
