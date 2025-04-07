const esbuild = require("esbuild")
const fs = require("fs")
const path = require("path")

const production = process.argv.includes("--production")
const watch = process.argv.includes("--watch")

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: "esbuild-problem-matcher",

	setup(build) {
		build.onStart(() => {
			console.log("[watch] build started")
		})
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`)
				console.error(`    ${location.file}:${location.line}:${location.column}:`)
			})
			console.log("[watch] build finished")
		})
	},
}

const copyWasmFiles = {
	name: "copy-wasm-files",
	setup(build) {
		build.onEnd(() => {
			// tree sitter
			const sourceDir = path.join(__dirname, "node_modules", "web-tree-sitter")
			const targetDir = path.join(__dirname, "dist")

			// Create dist directory if it doesn't exist
			if (!fs.existsSync(targetDir)) {
				fs.mkdirSync(targetDir, { recursive: true });
			}

			// Copy tree-sitter.wasm only if it exists
			const treeSitterWasmPath = path.join(sourceDir, "tree-sitter.wasm");
			if (fs.existsSync(treeSitterWasmPath)) {
				fs.copyFileSync(treeSitterWasmPath, path.join(targetDir, "tree-sitter.wasm"));
			} else {
				console.warn(`[copy-wasm-files] Warning: ${treeSitterWasmPath} not found, skipping.`);
			}

			// Copy language-specific WASM files
			const languageWasmDir = path.join(__dirname, "node_modules", "tree-sitter-wasms", "out")
			if (fs.existsSync(languageWasmDir)) {
				const languages = [
					"typescript",
					"tsx",
					"python",
					"rust",
					"javascript",
					"go",
					"cpp",
					"c",
					"c_sharp",
					"ruby",
					"java",
					"php",
					"swift",
					"kotlin",
				]

				languages.forEach((lang) => {
					const filename = `tree-sitter-${lang}.wasm`;
					const sourcePath = path.join(languageWasmDir, filename);
					if (fs.existsSync(sourcePath)) {
						fs.copyFileSync(sourcePath, path.join(targetDir, filename));
					} else {
						console.warn(`[copy-wasm-files] Warning: ${sourcePath} not found, skipping.`);
					}
				})
			} else {
				console.warn(`[copy-wasm-files] Warning: Language WASM directory ${languageWasmDir} not found, skipping.`);
			}
		})
	},
}

const copyAssets = {
  name: "copy-assets",
  setup(build) {
    build.onEnd(() => {
      const assetDirs = [
        { src: path.join(__dirname, "src", "core", "prompts", "sections"), dest: "sections" },
        { src: path.join(__dirname, "src", "core", "prompts", "rules"), dest: "rules" },
        { src: path.join(__dirname, "assets"), dest: "assets" } // Root assets folder
      ];
      
      const targetBaseDir = path.join(__dirname, "dist");
      
      assetDirs.forEach(({ src, dest }) => {
        const targetDir = path.join(targetBaseDir, dest);
        try {
          if (fs.existsSync(src)) {
            // Use fs.cpSync for recursive copying
            fs.cpSync(src, targetDir, { recursive: true, force: true }); 
            console.log(`[copy-assets] Copied ${src} to ${targetDir}`);
          } else {
            console.warn(`[copy-assets] Source directory not found: ${src}`);
          }
        } catch (err) {
            console.error(`[copy-assets] Error copying ${src} to ${targetDir}:`, err);
        }
      });
    });
  },
};

const extensionConfig = {
	bundle: true,
	minify: production,
	sourcemap: !production,
	logLevel: "silent",
	plugins: [
		copyWasmFiles,
        copyAssets, // Add the new plugin here
		esbuildProblemMatcherPlugin
	],
	entryPoints: ["src/extension.ts"],
	format: "cjs",
	sourcesContent: false,
	platform: "node",
	outfile: "dist/extension.js",
	external: ["vscode"],
}

async function main() {
	const extensionCtx = await esbuild.context(extensionConfig)
	if (watch) {
		await extensionCtx.watch()
	} else {
		await extensionCtx.rebuild()
		await extensionCtx.dispose()
	}
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
