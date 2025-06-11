// Caret 전용 VSCode 메시지 헬퍼 함수들

// VSCode API 접근을 위한 타입 정의
declare const acquireVsCodeApi: () => {
  postMessage: (message: any) => void
  getState: () => any
  setState: (state: any) => void
}

export const vscode = acquireVsCodeApi()

// Caret 전용 메시지 헬퍼들
export const sendPersonaMessage = (type: string, payload?: any) => {
  const message = {
    type,
    ...payload
  }
  vscode.postMessage(message)
}

export const loadPersona = () => {
  sendPersonaMessage('loadPersona')
}

export const updatePersona = (persona: any) => {
  sendPersonaMessage('addOrUpdatePersona', { persona })
}

export const deletePersona = (personaId: string) => {
  sendPersonaMessage('deletePersona', { personaId })
}

export const requestTemplateCharacters = () => {
  sendPersonaMessage('requestTemplateCharacters')
} 