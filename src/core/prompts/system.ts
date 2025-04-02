import { getShell } from "../../utils/shell"
import os from "os"
import osName from "os-name"
import { McpHub } from "../../services/mcp/McpHub"
import { BrowserSettings } from "../../shared/BrowserSettings"
import fs from "fs/promises"
import path from "path"
import * as corePrompt from "./core_system_prompt.json"

interface ToolDefinition {
	description: string
	params: {
		[key: string]: {
			type: string
			required: boolean
			desc: string
		}
	}
}

interface RulesJson {
	rules: string[]
}

interface SectionJson {
	content: string
}

/**
 * Loads JSON file from specified path
 */
async function loadJsonFile<T>(filePath: string): Promise<T> {
	try {
		const content = await fs.readFile(filePath, "utf-8")
		return JSON.parse(content) as T
	} catch (error) {
		console.error(`Error loading JSON from ${filePath}:`, error)
		throw error
	}
}

/**
 * Loads a section from either JSON or markdown file
 */
async function loadSection(sectionsDir: string, sectionName: string): Promise<string> {
	try {
		const jsonPath = path.join(sectionsDir, `${sectionName}.json`)
		const jsonContent = await loadJsonFile<SectionJson>(jsonPath)
		return jsonContent.content
	} catch (error) {
		console.error(`Error loading section ${sectionName}:`, error)
		// Fallback to markdown file if JSON loading fails
		const mdPath = path.join(sectionsDir, `${sectionName}.md`)
		return await fs.readFile(mdPath, "utf-8")
	}
}

/**
 * Loads rules from JSON file
 */
async function loadRules(rulesDir: string, ruleName: string): Promise<string[]> {
	try {
		const jsonPath = path.join(rulesDir, `${ruleName}.json`)
		const rulesContent = await loadJsonFile<RulesJson>(jsonPath)
		return rulesContent.rules
	} catch (error) {
		console.error(`Error loading rules ${ruleName}:`, error)
		// Fallback to markdown if JSON loading fails
		const mdPath = path.join(rulesDir, `${ruleName}.md`)
		const content = await fs.readFile(mdPath, "utf-8")
		return [content]
	}
}

export const SYSTEM_PROMPT = async (
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
): Promise<string> => {
	const promptsDir = path.join(__dirname, "..")
	const sectionsDir = path.join(promptsDir, "sections")
	const rulesDir = path.join(promptsDir, "rules")

	// Use directly imported core system prompt JSON
	// No need to load from file path which can cause path resolution issues

	// 현재 모드 결정
	const currentMode = supportsComputerUse ? "act_mode" : "plan_mode"
	const modeConfig = corePrompt.modes[currentMode]

	// 기본 프롬프트 구성
	let systemPrompt = `You are Cline, a highly skilled software engineer with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.

====

TOOL USE

You have access to a set of tools that are executed upon the user's approval. You can use one tool per message, and will receive the result of that tool use in the user's response. You use tools step-by-step to accomplish a given task, with each tool use informed by the result of the previous tool use.

# Tool Use Formatting

Tool use is formatted using XML-style tags. The tool name is enclosed in opening and closing tags, and each parameter is similarly enclosed within its own set of tags. Here's the structure:

<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>

For example:

<read_file>
<path>src/main.js</path>
</read_file>

Always adhere to this format for the tool use to ensure proper parsing and execution.`

	// 도구 정의 로드 및 포맷팅
	try {
		const toolDefinitionsPath = path.join(sectionsDir, "TOOL_DEFINITIONS.json")
		const toolDefsData = await loadJsonFile<{ tools: { [key: string]: ToolDefinition } }>(toolDefinitionsPath)

		systemPrompt += "\n\n# Tools"

		for (const toolName in toolDefsData.tools) {
			const tool = toolDefsData.tools[toolName]
			systemPrompt += `\n\n## ${toolName}\nDescription: ${tool.description}`
			systemPrompt += "\nParameters:"
			for (const paramName in tool.params) {
				const param = tool.params[paramName]
				systemPrompt += `\n- ${paramName}: (${param.required ? "required" : "optional"}) ${param.desc}`
			}
			// 기본 사용법 예시 추가 (필요 시)
			// systemPrompt += `\nUsage:\n<${toolName}>\n...</${toolName}>`
		}
	} catch (error) {
		console.error("Error loading or formatting tool definitions:", error)
	}

	// 나머지 섹션 로딩 로직 (헤더와 함께 구조적으로 추가)
	try {
		for (const sectionRef of modeConfig.sections_ref) {
			const sectionName = sectionRef.replace(".json", "")
			// 이미 처리된 TOOL_DEFINITIONS는 건너뜀
			if (sectionName === "TOOL_DEFINITIONS") continue

			try {
				const sectionContent = await loadSection(sectionsDir, sectionName)
				// 섹션 이름으로 헤더 추가 (예: # Tool Use Examples)
				let formattedContent = sectionContent
				if (sectionName === "EDITING_FILES_GUIDE") {
					try {
						const guideData = JSON.parse(sectionContent)
						formattedContent = `# EDITING FILES GUIDE\n\n`
						guideData.tools.forEach((tool: any) => {
							formattedContent += `## ${tool.name}\n\n`
							formattedContent += `### Purpose\n- ${tool.purpose}\n\n`
							formattedContent += `### When to Use\n${tool.when_to_use.map((item: string) => `- ${item}`).join("\n")}\n\n`
							if (tool.important_considerations) {
								formattedContent += `### Important Considerations\n${tool.important_considerations.map((item: string) => `- ${item}`).join("\n")}\n\n`
							}
							if (tool.advantages) {
								formattedContent += `### Advantages\n${tool.advantages.map((item: string) => `- ${item}`).join("\n")}\n\n`
							}
						})
						formattedContent += `### Choosing the Appropriate Tool\n${guideData.choosing_the_appropriate_tool.map((item: string) => `- ${item}`).join("\n")}\n\n`
						formattedContent += `### Auto-formatting Considerations\n${guideData.auto_formatting_considerations.map((item: string) => `- ${item}`).join("\n")}\n\n`
						formattedContent += `### Workflow Tips\n${guideData.workflow_tips.map((item: string) => `- ${item}`).join("\n")}`
					} catch (parseError) {
						console.error("Error parsing EDITING_FILES_GUIDE.json:", parseError)
						// 파싱 실패 시 원본 내용 사용
						formattedContent = `# EDITING FILES GUIDE\n\n${sectionContent}`
					}
				} else {
					const header = `# ${sectionName.replace(/_/g, " ")}`
					formattedContent = `${header}\n\n${sectionContent}`
				}
				systemPrompt += `\n\n====\n\n${formattedContent}`
			} catch (error) {
				console.error(`Error loading section ${sectionRef}:`, error)
				// 오류가 있어도 계속 진행
			}
		}
	} catch (error) {
		console.error("Error loading sections:", error)
	}

	// 규칙 로딩 로직 (헤더와 함께 구조적으로 추가)
	try {
		systemPrompt += "\n\n====\n\n# RULES\n"
		for (const ruleRef of modeConfig.rules_ref) {
			const rules = await loadRules(rulesDir, ruleRef.replace(".json", ""))
			systemPrompt += "\n" + rules.join("\n")
		}
	} catch (error) {
		console.error("Error loading rules:", error)
	}

	return systemPrompt
}

export function addUserInstructions(
	settingsCustomInstructions?: string,
	clineRulesFileInstructions?: string,
	clineIgnoreInstructions?: string,
	preferredLanguageInstructions?: string,
): string {
	let customInstructions = ""
	if (preferredLanguageInstructions) {
		customInstructions += preferredLanguageInstructions + "\n\n"
	}
	if (settingsCustomInstructions) {
		customInstructions += settingsCustomInstructions + "\n\n"
	}
	if (clineRulesFileInstructions) {
		customInstructions += clineRulesFileInstructions + "\n\n"
	}
	if (clineIgnoreInstructions) {
		customInstructions += clineIgnoreInstructions
	}

	return `
====

USER'S CUSTOM INSTRUCTIONS

The following additional instructions are provided by the user, and should be followed to the best of your ability without interfering with the TOOL USE guidelines.

${customInstructions.trim()}`
}
