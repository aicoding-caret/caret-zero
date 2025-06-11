import fs from "fs/promises";
import path from "path";
// Removed: import * as corePrompt from "./core_system_prompt.json"
// Define default sections and rules, combining previous modes and removing MODES_EXPLANATION
const defaultSectionsRef = [
    // BASE_PROMPT_INTRO and TOOL_DEFINITIONS handled separately below
    "TOOL_USE_FORMAT.json",
    "TOOL_USE_EXAMPLES.json",
    "TOOL_USE_GUIDELINES.json",
    "MCP_SERVERS_HEADER.json",
    "MCP_CONNECTED_SERVERS.json",
    "MCP_CREATION_GUIDE.json",
    "EDITING_FILES_GUIDE.json",
    "CAPABILITIES_SUMMARY.json",
    "RULES_HEADER.json",
    "SYSTEM_INFORMATION.json",
    "OBJECTIVE.json",
];
const defaultRulesRef = [
    "common_rules.json",
    "file_editing_rules.json",
    "cost_consideration_rules.json",
];
/**
 * Reads a file and returns its content as a string. Throws if read fails or content is not string.
 */
async function readFileSafely(filePath) {
    try {
        const content = await fs.readFile(filePath, "utf-8");
        if (typeof content !== "string") {
            throw new Error(`readFile did not return a string for ${filePath}. Got type: ${typeof content}`);
        }
        return content;
    }
    catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        if (error instanceof Error && "code" in error && error.code === "ENOENT") {
            throw new Error(`File not found: ${filePath}`);
        }
        throw error;
    }
}
/**
 * Loads and parses a JSON file directly using readFileSafely.
 */
async function loadAndParseJsonFile(filePath) {
    let fileContent;
    try {
        fileContent = await readFileSafely(filePath);
        return JSON.parse(fileContent);
    }
    catch (error) {
        console.error(`Error loading/parsing JSON from ${filePath}. Content snippet (if read): ${fileContent ? `"${fileContent.substring(0, 100)}..."` : "read failed or empty"}. Error:`, error);
        throw error;
    }
}
/**
 * Loads section content. Tries JSON first, stringifies it if valid. Falls back to MD.
 */
async function loadAndFormatSectionContent(sectionsDir, sectionName) {
    const jsonPath = path.join(sectionsDir, `${sectionName}.json`);
    const mdPath = path.join(sectionsDir, `${sectionName}.md`);
    try {
        // Try reading and parsing JSON first
        const fileContent = await readFileSafely(jsonPath);
        const parsedData = JSON.parse(fileContent); // Check if it's valid JSON of *any* structure
        // If parsing succeeded, stringify the parsed data for inclusion
        // Special case: if it's just a string (like RULES_HEADER.json), use it directly.
        if (typeof parsedData === "string") {
            return parsedData;
        }
        else {
            return JSON.stringify(parsedData, null, 2); // Pretty-print JSON object/array
        }
    }
    catch (jsonError) {
        // Fallback to markdown file if JSON reading/parsing failed
        try {
            console.log(`Falling back to markdown for section: ${sectionName} (JSON error: ${jsonError instanceof Error ? jsonError.message : String(jsonError)})`);
            return await readFileSafely(mdPath); // Read MD content
        }
        catch (mdError) {
            console.error(`Error loading section ${sectionName} (tried both .json and .md):`, mdError);
            // Return an error message string if both fail
            return `[ERROR: Failed to load content for this section from both .json and .md]`;
        }
    }
}
/**
 * Loads rules. Tries JSON first (expecting { "rules": [...] }), then MD.
 */
async function loadRules(rulesDir, ruleName) {
    const jsonPath = path.join(rulesDir, `${ruleName}.json`);
    const mdPath = path.join(rulesDir, `${ruleName}.md`);
    try {
        const rulesContent = await loadAndParseJsonFile(jsonPath);
        if (Array.isArray(rulesContent?.rules)) {
            return rulesContent.rules;
        }
        else {
            if (typeof rulesContent === "string") {
                console.warn(`Rule file ${ruleName}.json is a string, not {rules:[]}. Using content as single rule.`);
                return [rulesContent];
            }
            throw new Error(`Invalid structure in ${ruleName}.json: 'rules' key missing or not an array.`);
        }
    }
    catch (jsonError) {
        // Fallback to markdown
        try {
            console.log(`Falling back to markdown for rule: ${ruleName}`);
            const content = await readFileSafely(mdPath);
            return [content];
        }
        catch (mdError) {
            console.error(`Error loading rules ${ruleName} (tried both .json and .md):`, mdError);
            return [`[ERROR LOADING RULE: ${ruleName} - ${mdError instanceof Error ? mdError.message : String(mdError)}]`];
        }
    }
}
// Helper to format the guide data safely
function formatEditingGuide(guideData) {
    if (!guideData) {
        return "Error: Invalid guide data provided for formatting (null or undefined).";
    }
    let formatted = "";
    if (Array.isArray(guideData.tools)) {
        guideData.tools.forEach((tool) => {
            formatted += `## ${tool?.name || "Unnamed Tool"}\n\n`;
            formatted += `### Purpose\n- ${tool?.purpose || "N/A"}\n\n`;
            formatted += `### When to Use\n${Array.isArray(tool?.when_to_use) ? tool.when_to_use.map((item) => `- ${item}`).join("\n") : "N/A"}\n\n`;
            if (Array.isArray(tool?.important_considerations)) {
                formatted += `### Important Considerations\n${tool.important_considerations.map((item) => `- ${item}`).join("\n")}\n\n`;
            }
            if (Array.isArray(tool?.advantages)) {
                formatted += `### Advantages\n${tool.advantages.map((item) => `- ${item}`).join("\n")}\n\n`;
            }
        });
    }
    else {
        formatted += "Note: 'tools' array not found in guide data.\n\n";
    }
    if (Array.isArray(guideData.choosing_the_appropriate_tool)) {
        formatted += `### Choosing the Appropriate Tool\n${guideData.choosing_the_appropriate_tool.map((item) => `- ${item}`).join("\n")}\n\n`;
    }
    if (Array.isArray(guideData.auto_formatting_considerations)) {
        formatted += `### Auto-formatting Considerations\n${guideData.auto_formatting_considerations.map((item) => `- ${item}`).join("\n")}\n\n`;
    }
    if (Array.isArray(guideData.workflow_tips)) {
        formatted += `### Workflow Tips\n${guideData.workflow_tips.map((item) => `- ${item}`).join("\n")}`;
    }
    return formatted;
}
export const SYSTEM_PROMPT = async (cwd, supportsComputerUse, // This parameter might become less relevant or used differently
mcpHub, browserSettings) => {
    const sectionsDir = path.join(__dirname, "sections");
    const rulesDir = path.join(__dirname, "rules");
    // Removed mode selection logic:
    // const currentMode = supportsComputerUse ? "act_mode" : "plan_mode"
    // const modeConfig = corePrompt.modes[currentMode] || { sections_ref: [], rules_ref: [] }
    let systemPrompt = ""; // Initialize empty
    // Load Base Prompt Intro first
    try {
        const introPath = path.join(sectionsDir, "BASE_PROMPT_INTRO.json");
        const introData = await loadAndParseJsonFile(introPath);
        // Construct the intro string from the structured JSON
        systemPrompt += `${introData.introduction}\n\n====\n\n`;
        systemPrompt += `${introData.tool_use_header}\n\n${introData.tool_use_description}\n\n`;
        systemPrompt += `# ${introData.formatting_header}\n\n${introData.formatting_description}\n\n`;
        // Ensure examples are wrapped in markdown code blocks
        systemPrompt += `\`\`\`xml\n${introData.formatting_structure_example}\n\`\`\`\n\n`;
        systemPrompt += `${introData.formatting_example_header}\n\n\`\`\`xml\n${introData.formatting_example_code}\n\`\`\`\n\n`;
        systemPrompt += `${introData.formatting_note}`;
    }
    catch (error) {
        console.error("CRITICAL: Error loading or parsing BASE_PROMPT_INTRO.json:", error);
        systemPrompt += `[ERROR LOADING BASE PROMPT INTRO: ${error instanceof Error ? error.message : String(error)}]`; // Add error message if loading fails
    }
    // Load Tool Definitions
    try {
        const toolDefinitionsPath = path.join(sectionsDir, "TOOL_DEFINITIONS.json");
        const toolDefsData = await loadAndParseJsonFile(toolDefinitionsPath);
        // Append Tool section header only if intro was loaded successfully
        if (!systemPrompt.startsWith("[ERROR")) {
            systemPrompt += "\n\n====\n\n# Tools"; // Add separator before Tools section
        }
        else {
            systemPrompt += "\n\n# Tools"; // Still add header even if intro failed
        }
        if (toolDefsData && typeof toolDefsData.tools === "object") {
            for (const toolName in toolDefsData.tools) {
                const tool = toolDefsData.tools[toolName];
                systemPrompt += `\n\n## ${toolName}\nDescription: ${tool?.description || "No description"}`;
                systemPrompt += "\nParameters:";
                if (tool?.params && typeof tool.params === "object") {
                    for (const paramName in tool.params) {
                        const param = tool.params[paramName];
                        systemPrompt += `\n- ${paramName}: (${param?.required ? "required" : "optional"}) ${param?.desc || "No description"}`;
                    }
                    systemPrompt += `\nUsage:\n<${toolName}>`;
                    const paramsString = Object.entries(tool.params)
                        .map(([name, details]) => `\n<${name}>${details?.required ? "Required value" : "Optional value"}</${name}>`)
                        .join("");
                    systemPrompt += `${paramsString}\n</${toolName}>`;
                }
                else {
                    systemPrompt += "\n- No parameters defined.";
                    systemPrompt += `\nUsage:\n<${toolName}></${toolName}>`;
                }
            }
        }
        else {
            systemPrompt += "\n\nTool definitions structure is invalid.";
        }
    }
    catch (error) {
        console.error("CRITICAL: Error loading or parsing TOOL_DEFINITIONS.json:", error);
        systemPrompt += `\n\n====\n\n# ERROR LOADING TOOL DEFINITIONS\n\n[${error instanceof Error ? error.message : String(error)}]`;
    }
    // Load other sections using the default list
    try {
        if (Array.isArray(defaultSectionsRef)) {
            for (const sectionRef of defaultSectionsRef) {
                const sectionName = sectionRef.replace(/\.(json|md)$/i, "");
                // Skip sections already handled (TOOL_DEFINITIONS is handled above, BASE_PROMPT_INTRO is first)
                // No need to check sectionName === "TOOL_DEFINITIONS" || sectionName === "BASE_PROMPT_INTRO" because they are not in defaultSectionsRef
                const header = `# ${sectionName.replace(/_/g, " ")}`;
                let sectionOutput = "";
                try {
                    if (sectionName === "EDITING_FILES_GUIDE") {
                        const guidePath = path.join(sectionsDir, `${sectionName}.json`);
                        try {
                            const guideData = await loadAndParseJsonFile(guidePath);
                            sectionOutput = formatEditingGuide(guideData);
                        }
                        catch (guideError) {
                            console.error(`Error loading/parsing specific structure for ${sectionName}.json:`, guideError);
                            sectionOutput = await loadAndFormatSectionContent(sectionsDir, sectionName); // Fallback
                        }
                    }
                    else {
                        // Load all other sections: try JSON stringify first, then MD
                        sectionOutput = await loadAndFormatSectionContent(sectionsDir, sectionName);
                    }
                    // Append the final content (either formatted JSON, stringified JSON, MD, or error message)
                    systemPrompt += `\n\n====\n\n${header}\n\n${sectionOutput}`;
                }
                catch (error) {
                    // Catch errors from loading attempts
                    console.error(`Error processing section ${sectionName}:`, error);
                    systemPrompt += `\n\n====\n\n${header}\n\n[ERROR: Failed to load content for this section.]`;
                }
            }
        }
        else {
            console.error("defaultSectionsRef is not an array or is missing"); // Updated error message
        }
    }
    catch (error) {
        console.error("Error processing sections loop:", error);
    }
    // Load rules using the default list
    try {
        systemPrompt += "\n\n====\n\n# RULES\n";
        if (Array.isArray(defaultRulesRef)) {
            for (const ruleRef of defaultRulesRef) {
                const ruleName = ruleRef.replace(/\.(json|md)$/i, "");
                try {
                    const rules = await loadRules(rulesDir, ruleName);
                    // Join rules into a single string block for the prompt
                    systemPrompt += "\n" + rules.join("\n");
                }
                catch (error) {
                    console.error(`Error loading rules ${ruleName}:`, error);
                    systemPrompt += `\n[ERROR LOADING RULE: ${ruleName} - ${error instanceof Error ? error.message : String(error)}]`;
                }
            }
        }
        else {
            console.error("defaultRulesRef is not an array or is missing"); // Updated error message
        }
    }
    catch (error) {
        console.error("Error processing rules loop:", error);
    }
    return systemPrompt;
};
// This function remains separate and unchanged
export function addUserInstructions(settingsCustomInstructions, caretRulesFileInstructions, caretIgnoreInstructions, preferredLanguageInstructions, globalCaretRulesFileInstructions, localCaretRulesFileInstructions, localCursorRulesFileInstructions, localCursorRulesDirInstructions, localWindsurfRulesFileInstructions, modeSpecificRules) {
    let customInstructions = "";
    if (preferredLanguageInstructions) {
        // Added braces
        customInstructions += preferredLanguageInstructions + "\n\n";
    }
    if (settingsCustomInstructions) {
        // Added braces
        customInstructions += settingsCustomInstructions + "\n\n";
    }
    if (caretRulesFileInstructions) {
        // Added braces
        customInstructions += caretRulesFileInstructions + "\n\n";
    }
    if (caretIgnoreInstructions) {
        // Added braces
        customInstructions += caretIgnoreInstructions;
    }
    if (globalCaretRulesFileInstructions) {
        customInstructions += globalCaretRulesFileInstructions + "\n\n";
    }
    if (localCaretRulesFileInstructions) {
        customInstructions += localCaretRulesFileInstructions + "\n\n";
    }
    if (localCursorRulesFileInstructions) {
        customInstructions += localCursorRulesFileInstructions + "\n\n";
    }
    if (localCursorRulesDirInstructions) {
        customInstructions += localCursorRulesDirInstructions + "\n\n";
    }
    if (localWindsurfRulesFileInstructions) {
        customInstructions += localWindsurfRulesFileInstructions + "\n\n";
    }
    // Mode Rule 적용 계획 3.3: modeSpecificRules를 시스템 프롬프트에 추가
    if (modeSpecificRules && modeSpecificRules.length > 0) {
        customInstructions += "# MODE-SPECIFIC RULES\n";
        modeSpecificRules.forEach(rule => {
            customInstructions += `- ${rule}\n`;
        });
        customInstructions += "\n"; // Ensure a newline after the block of rules, before trim/wrap
    }
    if (customInstructions.trim()) {
        // Added braces
        return `
====

USER'S CUSTOM INSTRUCTIONS

The following additional instructions are provided by the user, and should be followed to the best of your ability without interfering with the TOOL USE guidelines.

${customInstructions.trim()}`;
    }
    else {
        return "";
    }
}
//# sourceMappingURL=system.js.map