// Caret 전용 VSCode 메시지 헬퍼 함수들
export const vscode = acquireVsCodeApi();
// Caret 전용 메시지 헬퍼들
export const sendPersonaMessage = (type, payload) => {
    const message = {
        type,
        ...payload
    };
    vscode.postMessage(message);
};
export const loadPersona = () => {
    sendPersonaMessage('loadPersona');
};
export const updatePersona = (persona) => {
    sendPersonaMessage('addOrUpdatePersona', { persona });
};
export const deletePersona = (personaId) => {
    sendPersonaMessage('deletePersona', { personaId });
};
export const requestTemplateCharacters = () => {
    sendPersonaMessage('requestTemplateCharacters');
};
//# sourceMappingURL=vscode.js.map