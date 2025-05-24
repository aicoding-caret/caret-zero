import path from "path"
import { ensureRulesDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { fileExistsAtPath, isDirectory, readDirectory } from "@utils/fs"
import { formatResponse } from "@core/prompts/responses"
import fs from "fs/promises"
import { CaretRulesToggles } from "@shared/caret-rules"
import { getGlobalState, getWorkspaceState, updateGlobalState, updateWorkspaceState } from "@core/storage/state"
import * as vscode from "vscode"
import { synchronizeRuleToggles, getRuleFilesTotalContent } from "@core/context/instructions/user-instructions/rule-helpers"

export const getGlobalCaretRules = async (globalCaretRulesFilePath: string, toggles: CaretRulesToggles) => {
	if (await fileExistsAtPath(globalCaretRulesFilePath)) {
		if (await isDirectory(globalCaretRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(globalCaretRulesFilePath)
				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, globalCaretRulesFilePath, toggles)
				if (rulesFilesTotalContent) {
					const caretRulesFileInstructions = formatResponse.caretRulesGlobalDirectoryInstructions(
						globalCaretRulesFilePath,
						rulesFilesTotalContent,
					)
					return caretRulesFileInstructions
				}
			} catch {
				console.error(`Failed to read .caretrules directory at ${globalCaretRulesFilePath}`)
			}
		} else {
			console.error(`${globalCaretRulesFilePath} is not a directory`)
			return undefined
		}
	}

	return undefined
}

export const getLocalCaretRules = async (cwd: string, toggles: CaretRulesToggles) => {
	const caretRulesFilePath = path.resolve(cwd, GlobalFileNames.caretRules)

	let caretRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(caretRulesFilePath)) {
		if (await isDirectory(caretRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(caretRulesFilePath, [[".caretrules", "workflows"]])

				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					caretRulesFileInstructions = formatResponse.caretRulesLocalDirectoryInstructions(cwd, rulesFilesTotalContent)
				}
			} catch {
				console.error(`Failed to read .caretrules directory at ${caretRulesFilePath}`)
			}
		} else {
			try {
				if (caretRulesFilePath in toggles && toggles[caretRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(caretRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						caretRulesFileInstructions = formatResponse.caretRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .caretrules file at ${caretRulesFilePath}`)
			}
		}
	}

	return caretRulesFileInstructions
}

export async function refreshCaretRulesToggles(
	context: vscode.ExtensionContext,
	workingDirectory: string,
): Promise<{
	globalToggles: CaretRulesToggles
	localToggles: CaretRulesToggles
}> {
	// Global toggles
	const globalCaretRulesToggles = ((await getGlobalState(context, "globalCaretRulesToggles")) as CaretRulesToggles) || {}
	const globalCaretRulesFilePath = await ensureRulesDirectoryExists()
	const updatedGlobalToggles = await synchronizeRuleToggles(globalCaretRulesFilePath, globalCaretRulesToggles)
	await updateGlobalState(context, "globalCaretRulesToggles", updatedGlobalToggles)

	// Local toggles
	const localCaretRulesToggles = ((await getWorkspaceState(context, "localCaretRulesToggles")) as CaretRulesToggles) || {}
	const localCaretRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.caretRules)
	const updatedLocalToggles = await synchronizeRuleToggles(localCaretRulesFilePath, localCaretRulesToggles, "", [
		[".caretrules", "workflows"],
	])
	await updateWorkspaceState(context, "localCaretRulesToggles", updatedLocalToggles)

	return {
		globalToggles: updatedGlobalToggles,
		localToggles: updatedLocalToggles,
	}
}
