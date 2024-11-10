import type { Plugin } from "esbuild";
import {
	readdirSync,
	readFileSync,
	writeFileSync,
	copyFileSync,
	rmSync,
	mkdirSync,
	existsSync,
	statSync,
	utimesSync,
} from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";
import { Timer } from "../utils/Timer.js";

export const MinifyImagesPlugin = (): Plugin => ({
	name: "minify-images-plugin",
	setup(build) {
		build.onEnd(async () => {
			await Timer("Image minification and conversion", async () => {
				const srcDir = join(process.cwd(), "src/public");
				const outputDir = join(process.cwd(), "dist/public");
				const imageExtensions = [".jpg", ".jpeg", ".png", ".svg", ".gif"];
				const convertibleExtensions = [".jpg", ".jpeg", ".png"];

				// Crear el directorio de salida si no existe
				if (!existsSync(outputDir)) {
					mkdirSync(outputDir, { recursive: true });
				}

				// Copiar el directorio src/public a dist/public
				copyDirectory(srcDir, outputDir);

				// Procesar imágenes en dist/public
				await processImagesInDir(
					outputDir,
					imageExtensions,
					convertibleExtensions,
				);

				console.log(
					"Image minification and conversion completed successfully.",
				);
			});
		});
	},
});

const copyDirectory = (src: string, dest: string) => {
	// Crear el directorio de destino si no existe
	if (!existsSync(dest)) {
		mkdirSync(dest, { recursive: true });
	}
	// Leer el directorio
	const entries = readdirSync(src, { withFileTypes: true });
	// Iterar sobre los elementos del directorio
	for (const entry of entries) {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);
		// Si es un directorio, copiar recursivamente
		if (entry.isDirectory()) {
			copyDirectory(srcPath, destPath);
		} else if (entry.isFile()) {
			copyFileSync(srcPath, destPath);
		}
	}
};

const needsOptimization = (
	filePath: string,
	optimizedFilePath: string,
): boolean => {
	if (!existsSync(optimizedFilePath)) {
		return true;
	}
	const originalStats = statSync(filePath);
	const optimizedStats = statSync(optimizedFilePath);
	return originalStats.mtime > optimizedStats.mtime;
};

const minifyImage = async (filePath: string, outputFilePath: string) => {
	const buffer = readFileSync(filePath);
	let optimizedBuffer: Buffer;
	const ext = extname(filePath).toLowerCase();
	switch (ext) {
		case ".jpg":
		case ".jpeg":
			optimizedBuffer = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();
			break;
		case ".png":
			optimizedBuffer = await sharp(buffer).png({ quality: 80 }).toBuffer();
			break;
		case ".svg":
			optimizedBuffer = await sharp(buffer).toBuffer(); // SVG optimization can be more complex
			break;
		case ".gif":
			optimizedBuffer = await sharp(buffer).gif().toBuffer();
			break;
		default:
			optimizedBuffer = buffer;
	}
	writeFileSync(outputFilePath, optimizedBuffer);
	utimesSync(outputFilePath, new Date(), new Date()); // Actualizar la fecha de modificación del archivo optimizado
};

const convertImage = async (
	filePath: string,
	outputFilePath: string,
	format: "webp" | "avif",
) => {
	const buffer = readFileSync(filePath);
	let convertedBuffer: Buffer;
	switch (format) {
		case "webp":
			convertedBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
			break;
		case "avif":
			convertedBuffer = await sharp(buffer).avif({ quality: 50 }).toBuffer();
			break;
		default:
			throw new Error(`Unsupported format: ${format}`);
	}
	writeFileSync(outputFilePath, convertedBuffer);
	utimesSync(outputFilePath, new Date(), new Date()); // Actualizar la fecha de modificación del archivo convertido
};

const processImagesInDir = async (
	dir: string,
	imageExtensions: string[],
	convertibleExtensions: string[],
) => {
	const files = readdirSync(dir);
	const tasks = files.map(async (file) => {
		const filePath = join(dir, file);
		const stats = statSync(filePath);
		if (stats.isDirectory()) {
			await processImagesInDir(
				filePath,
				imageExtensions,
				convertibleExtensions,
			);
		} else {
			const ext = extname(file).toLowerCase();
			if (imageExtensions.includes(ext)) {
				const baseName = basename(file, ext);

				// Convertir a webp y avif solo si es .jpg, .jpeg o .png
				if (convertibleExtensions.includes(ext)) {
					const webpPath = join(dir, `${baseName}.webp`);
					const avifPath = join(dir, `${baseName}.avif`);
					if (needsOptimization(filePath, webpPath)) {
						await convertImage(filePath, webpPath, "webp");
					}
					if (needsOptimization(filePath, avifPath)) {
						await convertImage(filePath, avifPath, "avif");
					}
				}

				// Minificar la imagen original solo si no está optimizada
				const tempFilePath = `${filePath}.tmp`;
				if (needsOptimization(filePath, tempFilePath)) {
					await minifyImage(filePath, tempFilePath);
					rmSync(filePath); // Eliminar la imagen original
					copyFileSync(tempFilePath, filePath); // Renombrar la imagen optimizada
					rmSync(tempFilePath); // Eliminar el archivo temporal
				}
			}
		}
	});
	await Promise.all(tasks);
};
