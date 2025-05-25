/**
 * 웹뷰와 익스텐션 간의 메시지 타입을 정의합니다.
 * 기능별로 그룹화하여 관리합니다.
 */

/**
 * 모든 메시지 타입의 기본 열거형
 */
export enum MessageType {
	// uc6f9ubdf0 uad00ub828
	WEBVIEW_DID_LAUNCH = "webviewDidLaunch",

	// ubaa8ub4dc uad00ub828
	LOAD_MODES_CONFIG = "loadModesConfig",
	SELECT_MODE = "selectMode",
	TOGGLE_MODE = "toggleMode",
	SET_MODE = "setMode",

	// ud398ub974uc18cub098 uad00ub828
	REQUEST_TEMPLATE_CHARACTERS = "requestTemplateCharacters",
	SELECT_PERSONA = "selectPersona",
	UPDATE_PERSONA = "updatePersona",
	CREATE_PERSONA = "createPersona",
	DELETE_PERSONA = "deletePersona",

	// uc5b8uc5b4 uad00ub828
	SELECT_LANGUAGE = "selectLanguage",

	// ud0c0uc2a4ud06c uad00ub828
	CREATE_TASK = "createTask",
	UPDATE_TASK = "updateTask",
	DELETE_TASK = "deleteTask",
	SELECT_TASK = "selectTask",

	// ubaa8ub378 uad00ub828
	REQUEST_LM_STUDIO_MODELS = "requestLmStudioModels",
	REQUEST_VSCODE_LM_MODELS = "requestVsCodeLmModels",
	REQUEST_OPENROUTER_MODELS = "requestOpenRouterModels",

	// uc124uc815 uad00ub828
	UPDATE_SETTINGS = "updateSettings",
	REQUEST_SETTINGS = "requestSettings",

	// uae30ud0c0
	STATE_UPDATE = "state",
}

/**
 * ud398ub974uc18cub098 uad00ub828 uba54uc2dcuc9c0 ud0c0uc785 ubaa9ub85d
 */
export const PersonaMessages = {
	REQUEST_TEMPLATE_CHARACTERS: MessageType.REQUEST_TEMPLATE_CHARACTERS,
	SELECT_PERSONA: MessageType.SELECT_PERSONA,
	UPDATE_PERSONA: MessageType.UPDATE_PERSONA,
	CREATE_PERSONA: MessageType.CREATE_PERSONA,
	DELETE_PERSONA: MessageType.DELETE_PERSONA,
	SELECT_LANGUAGE: MessageType.SELECT_LANGUAGE,
}

/**
 * ubaa8ub4dc uad00ub828 uba54uc2dcuc9c0 ud0c0uc785 ubaa9ub85d
 */
export const ModeMessages = {
	LOAD_MODES_CONFIG: MessageType.LOAD_MODES_CONFIG,
	SELECT_MODE: MessageType.SELECT_MODE,
	TOGGLE_MODE: MessageType.TOGGLE_MODE,
	SET_MODE: MessageType.SET_MODE,
}

/**
 * ud0c0uc2a4ud06c uad00ub828 uba54uc2dcuc9c0 ud0c0uc785 ubaa9ub85d
 */
export const TaskMessages = {
	CREATE_TASK: MessageType.CREATE_TASK,
	UPDATE_TASK: MessageType.UPDATE_TASK,
	DELETE_TASK: MessageType.DELETE_TASK,
	SELECT_TASK: MessageType.SELECT_TASK,
}

/**
 * ubaa8ub378 uad00ub828 uba54uc2dcuc9c0 ud0c0uc785 ubaa9ub85d
 */
export const ModelMessages = {
	REQUEST_LM_STUDIO_MODELS: MessageType.REQUEST_LM_STUDIO_MODELS,
	REQUEST_VSCODE_LM_MODELS: MessageType.REQUEST_VSCODE_LM_MODELS,
	REQUEST_OPENROUTER_MODELS: MessageType.REQUEST_OPENROUTER_MODELS,
}

/**
 * uc124uc815 uad00ub828 uba54uc2dcuc9c0 ud0c0uc785 ubaa9ub85d
 */
export const SettingsMessages = {
	UPDATE_SETTINGS: MessageType.UPDATE_SETTINGS,
	REQUEST_SETTINGS: MessageType.REQUEST_SETTINGS,
}
