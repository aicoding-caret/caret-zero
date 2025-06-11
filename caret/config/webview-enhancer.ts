import { CaretStateProvider } from '../frontend/context/CaretStateContext'

export class WebviewEnhancer {
  static enhance(provider: any) {
    // Caret 컴포넌트 추가
    console.log('Enhancing webview with Caret components')
    
    // 메시지 핸들러 확장
    const originalHandleMessage = provider.handleMessage?.bind(provider)
    
    provider.handleMessage = async (message: any) => {
      // Caret 관련 메시지 먼저 처리
      if (message.type?.startsWith('persona') || message.type?.startsWith('template')) {
        console.log('Handling Caret message:', message.type)
        // Caret 메시지 처리 로직
        return true
      }
      
      // 기존 Cline 메시지 처리
      if (originalHandleMessage) {
        return await originalHandleMessage(message)
      }
      
      return false
    }
    
    // 상태 동기화 설정
    const enhancedProvider = {
      ...provider,
      caretStateProvider: CaretStateProvider,
      sendCaretMessage: (message: any) => {
        console.log('Sending Caret message to webview:', message)
        // 웹뷰로 메시지 전송
        provider.postMessage?.(message)
      }
    }
    
    return enhancedProvider
  }
} 