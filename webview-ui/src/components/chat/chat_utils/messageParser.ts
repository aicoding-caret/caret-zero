import { CaretAskQuestion, CaretMessage, CaretPlanModeResponse } from "../../../../../src/shared/ExtensionMessage"

/**
 * uba54uc2dcuc9c0 ud14duc2a4ud2b8ub97c uc904ubcf4uae30 ub2e8uc704ub85c ubd84ud560
 */
export function splitMessage(text: string): string[] {
	return text.split(/\n/)
}

/**
 * uc624ub958 ud14duc2a4ud2b8uc5d0uc11c JSON ubd84uc11d
 */
export function parseErrorText(text: string | undefined) {
	if (!text) {
		return undefined
	}
	try {
		const startIndex = text.indexOf("{")
		const endIndex = text.lastIndexOf("}")
		if (startIndex !== -1 && endIndex !== -1) {
			const jsonStr = text.substring(startIndex, endIndex + 1)
			const errorObject = JSON.parse(jsonStr)
			return errorObject
		}
	} catch (e) {
		// Not JSON or missing required fields
	}
	return undefined
}

/**
 * followup uba54uc2dcuc9c0 ud30cuc2f1
 */
export function parseFollowupMessage(message: CaretMessage): {
	question?: string
	options?: string[]
	selected?: string
} {
	let question: string | undefined
	let options: string[] | undefined
	let selected: string | undefined

	try {
		const parsedMessage = JSON.parse(message.text || "{}") as CaretAskQuestion
		question = parsedMessage.question
		options = parsedMessage.options
		selected = parsedMessage.selected
	} catch (e) {
		// legacy messages would pass question directly
		question = message.text
	}

	return { question, options, selected }
}

/**
 * plan_mode_respond uba54uc2dcuc9c0 ud30cuc2f1
 */
export function parsePlanModeResponse(message: CaretMessage): {
	response?: string
	options?: string[]
	selected?: string
} {
	let response: string | undefined
	let options: string[] | undefined
	let selected: string | undefined

	try {
		const parsedMessage = JSON.parse(message.text || "{}") as CaretPlanModeResponse
		response = parsedMessage.response
		options = parsedMessage.options
		selected = parsedMessage.selected
	} catch (e) {
		// legacy messages would pass response directly
		response = message.text
	}

	return { response, options, selected }
}

/**
 * uba54uc2dcuc9c0 ud0c0uc785uc5d0 ub530ub978 ud45cuc2dc ud14duc2a4ud2b8 ubc18ud658
 */
export function getMessageTypeText(message: CaretMessage): string | undefined {
	if (message.type === "say") {
		switch (message.say) {
			case "tool":
				return "Tool Call"
			case "command":
				return "Shell Command"
			case "reasoning":
				return "AI's Internal Analysis"
			case "completion_result":
				return "AI Response"
			case "use_mcp_server":
				return "MCP Server"
			default:
				return undefined
		}
	} else if (message.type === "ask") {
		switch (message.ask) {
			case "command":
				return "Command Request"
			case "followup":
				return "Question"
			case "completion_result":
				return "Thinking..."
			case "use_mcp_server":
				return "MCP Server Request"
			default:
				return undefined
		}
	}
	return undefined
}

/**
 * uba54uc2dcuc9c0uac00 AI uba54uc2dcuc9c0(uacc4uc0b0 uacb0uacfc, uc0acuc6a9uc790 ud53cub4dcubc31 uc81c uc678)uc778uc9c0 uc5ecubd80 ud655uc778
 */
export function isAiMessage(message: CaretMessage): boolean {
	// AI 메시지로 처리되어야 하는 메시지 타입 확인
	if (message.type === "say") {
		if (message.say === "completion_result" || 
			message.say === "reasoning" ||
			message.say === "text") {
			return true;
		}
	} else if (message.type === "ask" && message.ask === "completion_result") {
		// 생각 중 메시지도 AI 메시지로 처리
		return true;
	}
	return false;
}

/**
 * uba54uc2dcuc9c0uac00 uc0acuc6a9uc790 uba54uc2dcuc9c0(uc9c8ub7c8 ub4f1)uc778uc9c0 uc5ecubd80 ud655uc778
 */
export function isUserMessage(message: CaretMessage): boolean {
	// uc0acuc6a9uc790 ucc38uc5ec uad00ub828 uba54uc2dcuc9c0 uc720ud615ub9cc uc120ubcc4 
	if (message.type === "ask" && (
		message.ask === "followup" ||
		message.ask === "plan_mode_respond"
	)) {
		return true
	}
	if (message.type === "say" && message.say === "user_feedback") {
		return true
	}
	return false
}
