import { useCallback, useEffect } from 'react'
import { vscode } from '../../../utils/vscode'
import { ModeInfo } from '../../../../../src/shared/ExtensionMessage'

/**
 * 모드 단축키 관리를 위한 커스텀 훅
 * - ALT+숫자키 단축키로 모드 전환 기능
 * - 모드 목록 가져오기
 * - 현재 모드 확인 및 변경
 */
export function useModeShortcuts(
  availableModes: ModeInfo[] | undefined,
  chatSettings: { mode: string; [key: string]: any }
) {
  // ALT+1~9 단축키 처리 함수 (모드 전환)
  const handleKeydown = useCallback(
    (e: Event) => {
      const kbEvent = e as KeyboardEvent
      
      // ALT 키와 숫자 키가 함께 눌렸을 때 처리
      if (!kbEvent.ctrlKey && kbEvent.altKey && !kbEvent.shiftKey && !kbEvent.metaKey) {
        // 숫자 키 체크 - 숫자 키보드 (1-9)
        const keyNum = parseInt(kbEvent.key)

        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 9) {
          // 모드 인덱스 계산 (0부터 시작)
          const modeIndex = keyNum - 1

          // 사용 가능한 모드 확인 및 범위 체크
          if (availableModes && modeIndex < availableModes.length) {
            const targetMode = availableModes[modeIndex].id

            // 현재 모드와 다른 경우에만 변경
            if (chatSettings.mode !== targetMode) {
              vscode.postMessage({
                type: "updateSettings",
                chatSettings: { ...chatSettings, mode: targetMode },
              })
              kbEvent.preventDefault() // 기본 동작 방지
              kbEvent.stopPropagation() // 이벤트 버블링 중단 추가
              return true // 이벤트 처리 완료
            }
          }
        }
      }
      return false // 이벤트 처리 안함
    },
    [availableModes, chatSettings]
  )

  // 키보드 이벤트 리스너 등록 및 제거
  useEffect(() => {
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [handleKeydown])

  // 특정 모드로 변경하는 함수
  const changeMode = useCallback(
    (modeId: string) => {
      if (chatSettings.mode !== modeId) {
        vscode.postMessage({
          type: "updateSettings",
          chatSettings: { ...chatSettings, mode: modeId },
        })
      }
    },
    [chatSettings]
  )

  return {
    handleKeydown,
    changeMode,
  }
}
