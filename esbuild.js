const esbuild = require("esbuild")
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const production = process.argv.includes("--production")
const watch = process.argv.includes("--watch")
const standalone = process.argv.includes("--standalone")
const destDir = standalone ? "dist-standalone" : "dist"

// 의존성 검사 함수
async function checkDependencies() {
	try {
		console.log("Checking dependencies...")
		execSync("npm audit", { stdio: "inherit" })
	} catch (error) {
		console.warn("Warning: Some dependencies have security vulnerabilities.")
		console.warn("Consider running 'npm audit fix' to resolve them.")
	}
}

// 빌드 전 검사
async function preBuildChecks() {
	try {
		await checkDependencies()
		
		// 필요한 디렉토리 확인
		const requiredDirs = ["src", "dist"]
		for (const dir of requiredDirs) {
			if (!fs.existsSync(path.join(__dirname, dir))) {
				fs.mkdirSync(path.join(__dirname, dir), { recursive: true })
			}
		}
	} catch (error) {
		console.error("Pre-build checks failed:", error)
		process.exit(1)
	}
}

/**
 * @type {import('esbuild').Plugin}
 */
const aliasResolverPlugin = {
	name: "alias-resolver",
	setup(build) {
		const aliases = {
			"@": path.resolve(__dirname, "src"),
			"@api": path.resolve(__dirname, "src/api"),
			"@core": path.resolve(__dirname, "src/core"),
			"@integrations": path.resolve(__dirname, "src/integrations"),
			"@services": path.resolve(__dirname, "src/services"),
			"@shared": path.resolve(__dirname, "src/shared"),
			"@utils": path.resolve(__dirname, "src/utils"),
			"@packages": path.resolve(__dirname, "src/packages"),
		}

		// For each alias entry, create a resolver
		Object.entries(aliases).forEach(([alias, aliasPath]) => {
			const aliasRegex = new RegExp(`^${alias}($|/.*)`)
			build.onResolve({ filter: aliasRegex }, (args) => {
				const importPath = args.path.replace(alias, aliasPath)

				// First, check if the path exists as is
				if (fs.existsSync(importPath)) {
					const stats = fs.statSync(importPath)
					if (stats.isDirectory()) {
						// If it's a directory, try to find index files
						const extensions = [".ts", ".tsx", ".js", ".jsx"]
						for (const ext of extensions) {
							const indexFile = path.join(importPath, `index${ext}`)
							if (fs.existsSync(indexFile)) {
								return { path: indexFile }
							}
						}
					} else {
						// It's a file that exists, so return it
						return { path: importPath }
					}
				}

				// If the path doesn't exist, try appending extensions
				const extensions = [".ts", ".tsx", ".js", ".jsx"]
				for (const ext of extensions) {
					const pathWithExtension = `${importPath}${ext}`
					if (fs.existsSync(pathWithExtension)) {
						return { path: pathWithExtension }
					}
				}

				// If nothing worked, return the original path and let esbuild handle the error
				return { path: importPath }
			})
		})
	},
}

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
<<<<<<< HEAD
			try {
				// tree sitter
				const sourceDir = path.join(__dirname, "node_modules", "web-tree-sitter")
				const targetDir = path.join(__dirname, "dist")
=======
			// tree sitter
			const sourceDir = path.join(__dirname, "node_modules", "web-tree-sitter")
			const targetDir = path.join(__dirname, destDir)
>>>>>>> upstream/main

				// Ensure target directory exists
				if (!fs.existsSync(targetDir)) {
					fs.mkdirSync(targetDir, { recursive: true })
				}

				// Copy tree-sitter.wasm
				const treeSitterWasmPath = path.join(sourceDir, "tree-sitter.wasm")
				if (fs.existsSync(treeSitterWasmPath)) {
					fs.copyFileSync(treeSitterWasmPath, path.join(targetDir, "tree-sitter.wasm"))
				} else {
					console.warn("Warning: tree-sitter.wasm not found in source directory")
				}

				// Copy language-specific WASM files
				const languageWasmDir = path.join(__dirname, "node_modules", "tree-sitter-wasms", "out")
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
					const filename = `tree-sitter-${lang}.wasm`
					const sourcePath = path.join(languageWasmDir, filename)
					const targetPath = path.join(targetDir, filename)
					
					if (fs.existsSync(sourcePath)) {
						fs.copyFileSync(sourcePath, targetPath)
					} else {
						console.warn(`Warning: ${filename} not found in source directory`)
					}
				})
			} catch (error) {
				console.error("Error copying WASM files:", error)
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
				{ src: path.join(__dirname, "assets"), dest: "assets" }
			]

			const targetBaseDir = path.join(__dirname, "dist")

			assetDirs.forEach(({ src, dest }) => {
				const targetDir = path.join(targetBaseDir, dest)
				try {
					if (fs.existsSync(src)) {
						// Use fs.cpSync for recursive copying
						fs.cpSync(src, targetDir, { recursive: true, force: true })
						console.log(`[copy-assets] Copied ${src} to ${targetDir}`)
					} else {
						console.warn(`[copy-assets] Source directory not found: ${src}`)
					}
				} catch (err) {
					console.error(`[copy-assets] Error copying ${src} to ${targetDir}:`, err)
				}
			})
		})
	},
}

// Base configuration shared between extension and standalone builds
const baseConfig = {
	bundle: true,
	minify: production,
	sourcemap: !production,
	logLevel: "silent",
	define: {
		"process.env.IS_DEV": JSON.stringify(!production),
	},
	tsconfig: path.resolve(__dirname, "tsconfig.json"),
	plugins: [
		copyWasmFiles,
<<<<<<< HEAD
		copyAssets,
=======
>>>>>>> upstream/main
		aliasResolverPlugin,
		/* add to the end of plugins array */
		esbuildProblemMatcherPlugin,
		{
			name: "alias-plugin",
			setup(build) {
				build.onResolve({ filter: /^pkce-challenge$/ }, (args) => {
					return { path: require.resolve("pkce-challenge") }
				})
			},
		},
	],
	format: "cjs",
	sourcesContent: true,
	platform: "node",
}

// Extension-specific configuration
const extensionConfig = {
	...baseConfig,
	entryPoints: ["src/extension.ts"],
	outfile: `${destDir}/extension.js`,
	external: ["vscode"],
}

// Standalone-specific configuration
const standaloneConfig = {
	...baseConfig,
	entryPoints: ["src/standalone/standalone.ts"],
	outfile: `${destDir}/standalone.js`,
	// These gRPC protos need to load files from the module directory at runtime,
	// so they cannot be bundled.
	external: ["vscode", "@grpc/reflection", "grpc-health-check"],
}

async function main() {
<<<<<<< HEAD
	try {
		// 빌드 전 검사 실행
		await preBuildChecks()
		
		const extensionCtx = await esbuild.context(extensionConfig)
		if (watch) {
			await extensionCtx.watch()
		} else {
			await extensionCtx.rebuild()
			await extensionCtx.dispose()
		}
	} catch (error) {
		console.error("Build failed:", error)
		process.exit(1)
=======
	const config = standalone ? standaloneConfig : extensionConfig
	const extensionCtx = await esbuild.context(config)
	if (watch) {
		await extensionCtx.watch()
	} else {
		await extensionCtx.rebuild()
		await extensionCtx.dispose()
>>>>>>> upstream/main
	}
}

main().catch((error) => {
	console.error("Fatal error:", error)
	process.exit(1)
})
