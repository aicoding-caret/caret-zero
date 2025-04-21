import { AssistantMessageContent, TextContent, ToolUse, ToolParamName, toolParamNames, toolUseNames, ToolUseName } from "."

export function parseAssistantMessage(assistantMessage: string) {
	const contentBlocks: AssistantMessageContent[] = []
	let currentTextContent: TextContent | undefined = undefined
	let currentTextContentStartIndex = 0
	let currentToolUse: ToolUse | undefined = undefined
	let currentToolUseStartIndex = 0
	let currentParamName: ToolParamName | undefined = undefined
	let currentParamValueStartIndex = 0
	let accumulator = ""

	console.debug(`[Parser] Starting parsing. Message length: ${assistantMessage.length}`); // Added start log

	for (let i = 0; i < assistantMessage.length; i++) {
		const char = assistantMessage[i]
		accumulator += char

		// there should not be a param without a tool use
		if (currentToolUse && currentParamName) {
			const currentParamValue = accumulator.slice(currentParamValueStartIndex)
			const paramClosingTag = `</${currentParamName}>`
			if (currentParamValue.endsWith(paramClosingTag)) {
				// end of param value
				const extractedValue = currentParamValue.slice(0, -paramClosingTag.length); // Get value before trim
				const trimmedValue = extractedValue.trim();
				// Log extracted and trimmed value, especially for 'diff'
				console.debug(`[Parser] Param '${currentParamName}' ended. Extracted (len ${extractedValue.length}): "${extractedValue.substring(0,100)}...", Trimmed (len ${trimmedValue.length}): "${trimmedValue.substring(0,100)}..."`);

				// <<<--- Start Validation for 'diff' --- >>>
				let isValidParam = true;
				if (currentParamName === 'diff') {
					console.debug(`[Parser] Full extracted 'diff' value:\n${extractedValue}`); // Log full diff value
					const hasAllMarkers = extractedValue.includes("^SEARCH^") &&
										  extractedValue.includes("^======^") &&
										  extractedValue.includes("^REPLACE^");
					if (!hasAllMarkers) {
						console.error(`[Parser] Validation Failed for 'diff': Markers missing in extracted value. Discarding tool use.`);						
					} else {
						 console.debug(`[Parser] Validation Passed for 'diff': All markers present.`);
					}
				}
				// <<<--- End Validation for 'diff' --- >>>

				if (isValidParam && currentToolUse) { // Store only if valid and toolUse still exists
					currentToolUse.params[currentParamName] = trimmedValue;
				}
				currentParamName = undefined; // Reset param name regardless of validation
				continue; // Continue to next character
			} else {
				// partial param value is accumulating
				continue
			}
		}

		// no currentParamName

		if (currentToolUse) {
			const currentToolValue = accumulator.slice(currentToolUseStartIndex)
			const standardClosingTag = `</${currentToolUse.name}>`
			// 'write_to_file'을 사용할 경우 'write_file' 닫는 태그도 인식
			const alternativeClosingTag = currentToolUse.name === "write_to_file" ? "</write_file>" : ""

			if (
				currentToolValue.endsWith(standardClosingTag) ||
				(alternativeClosingTag && currentToolValue.endsWith(alternativeClosingTag))
			) {
				// end of a tool use
				console.debug(`[Parser] Tool use '${currentToolUse.name}' ended.`);
				currentToolUse.partial = false
				contentBlocks.push(currentToolUse)
				currentToolUse = undefined
				continue
			} else {
				const possibleParamOpeningTags = toolParamNames.map((name) => `<${name}>`)
				let foundParam = false; // Flag to check if a param tag was found
				for (const paramOpeningTag of possibleParamOpeningTags) {
					if (accumulator.endsWith(paramOpeningTag)) {
						// start of a new parameter
						currentParamName = paramOpeningTag.slice(1, -1) as ToolParamName
						currentParamValueStartIndex = accumulator.length
						console.debug(`[Parser] Param '${currentParamName}' started.`);
						foundParam = true;
						break
					}
				}

				// If a parameter tag was just found, continue to the next character
                if (foundParam) {
                    continue;
                }

				// there's no current param, and not starting a new param

				// special case for write_to_file where file contents could contain the closing tag...
				const contentParamName: ToolParamName = "content"
				if (currentToolUse.name === "write_to_file" && accumulator.endsWith(`</${contentParamName}>`)) {
					const toolContent = accumulator.slice(currentToolUseStartIndex)
					const contentStartTag = `<${contentParamName}>`
					const contentEndTag = `</${contentParamName}>`
					const contentStartIndex = toolContent.indexOf(contentStartTag) + contentStartTag.length
					const contentEndIndex = toolContent.lastIndexOf(contentEndTag)
					if (contentStartIndex !== -1 && contentEndIndex !== -1 && contentEndIndex > contentStartIndex) {
						const extractedValue = toolContent.slice(contentStartIndex, contentEndIndex);
						const trimmedValue = extractedValue.trim();
						console.debug(`[Parser] Special write_to_file content extracted. Extracted (len ${extractedValue.length}): "${extractedValue.substring(0,100)}...", Trimmed (len ${trimmedValue.length}): "${trimmedValue.substring(0,100)}..."`);
						currentToolUse.params[contentParamName] = trimmedValue;
					}
				}

				// partial tool value is accumulating
				continue
			}
		}

		// no currentToolUse

		let didStartToolUse = false
		const possibleToolUseOpeningTags = toolUseNames.map((name) => `<${name}>`)
		for (const toolUseOpeningTag of possibleToolUseOpeningTags) {
			if (accumulator.endsWith(toolUseOpeningTag)) {
				// start of a new tool use
				const toolName = toolUseOpeningTag.slice(1, -1) as ToolUseName
				const normalizedToolName = toolName === "write_file" ? "write_to_file" : toolName
				console.debug(`[Parser] Tool use '${normalizedToolName}' started.`);

				currentToolUse = {
					type: "tool_use",
					name: normalizedToolName,
					params: {},
					partial: true,
				}
				currentToolUseStartIndex = accumulator.length
				if (currentTextContent) {
					currentTextContent.partial = false
					const textBeforeTool = currentTextContent.content
						.slice(0, -toolUseOpeningTag.slice(0, -1).length)
						.trim();
					currentTextContent.content = textBeforeTool;
					console.debug(`[Parser] Text block ended before tool use. Content: "${textBeforeTool.substring(0,100)}..."`);
					if (textBeforeTool) {
						contentBlocks.push(currentTextContent);
					}
					currentTextContent = undefined;
				}
				didStartToolUse = true
				break
			}
		}

		if (!didStartToolUse) {
			// no tool use, so it must be text
			if (currentTextContent === undefined) {
				currentTextContentStartIndex = i
				console.debug(`[Parser] Text block started at index ${i}.`);
			}
			const currentRawText = accumulator.slice(currentTextContentStartIndex);
			currentTextContent = {
				type: "text",
				content: currentRawText,
				partial: true,
			}
		}
	} // End of for loop

	// Handle stream ending mid-process
	if (currentToolUse) {
		console.warn(`[Parser] Stream ended with partial tool use: ${currentToolUse.name}`);
		if (currentParamName) {
			const extractedValue = accumulator.slice(currentParamValueStartIndex);
			const trimmedValue = extractedValue.trim();
			console.warn(`[Parser] Partial param '${currentParamName}'. Extracted: "${extractedValue.substring(0,100)}...", Trimmed: "${trimmedValue.substring(0,100)}..."`);

			// <<<--- Start Validation for partial 'diff' --- >>>
			let isValidParam = true;
			if (currentParamName === 'diff') {
				const hasAllMarkers = extractedValue.includes("^SEARCH^") &&
									  extractedValue.includes("^======^") &&
									  extractedValue.includes("^REPLACE^");
				if (!hasAllMarkers) {
					console.error(`[Parser] Validation Failed for partial 'diff': Markers missing. Discarding tool use.`);
					isValidParam = false;
				} else {
					 console.debug(`[Parser] Validation Passed for partial 'diff'.`);
				}
			}
			// <<<--- End Validation for partial 'diff' --- >>>

			if (isValidParam && currentToolUse) { // Store only if valid and toolUse still exists
				 currentToolUse.params[currentParamName] = trimmedValue;
			}
		}
		if (currentToolUse) { // Add tool use only if it wasn't discarded
			contentBlocks.push(currentToolUse);
		}
	}else if (currentTextContent) { // Check else if, as only one can be active
		const finalText = currentTextContent.content.trim();
		if (finalText) {
			currentTextContent.content = finalText;
			console.debug(`[Parser] Stream ended with partial text content (trimmed len ${finalText.length}): "${finalText.substring(0,100)}..."`);
			contentBlocks.push(currentTextContent);
		} else {
			console.debug(`[Parser] Stream ended with empty/whitespace-only text content.`);
		}
	}

	console.debug(`[Parser] Parsing finished. Found ${contentBlocks.length} content blocks.`);
	return contentBlocks
}
