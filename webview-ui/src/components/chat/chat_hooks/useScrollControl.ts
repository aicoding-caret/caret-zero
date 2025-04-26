import { useState, useRef, useCallback, RefObject, useMemo } from 'react'
import { VirtuosoHandle } from 'react-virtuoso'

/**
 * 채팅 스크롤 제어를 위한 커스텀 훅
 * - 스크롤 위치 감지
 * - 자동 스크롤 기능
 * - "맨 아래로" 버튼 표시/숨김 관리
 */
export function useScrollControl() {
  // 스크롤 관련 상태 및 참조
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const disableAutoScrollRef = useRef(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)

  // 스크롤 위치 변경 핸들러
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!scrollContainerRef.current) return
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
      const scrollBottom = scrollHeight - scrollTop - clientHeight
      const isBottom = scrollBottom < 10 // 10px 오차 허용
      
      setIsAtBottom(isBottom)
      setShowScrollToBottom(!isBottom)
      
      if (isBottom) {
        disableAutoScrollRef.current = false
      }
    },
    [scrollContainerRef, setIsAtBottom, setShowScrollToBottom, disableAutoScrollRef]
  )

  // 스크롤을 부드럽게 아래로 내리는 함수
  const scrollToBottomSmooth = useMemo(
    () => {
      let timeoutId: NodeJS.Timeout | null = null;
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          if (virtuosoRef.current) {
            virtuosoRef.current.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: "smooth" });
          }
        }, 10);
      };
    },
    [],
  );

  // 스크롤을 즉시 아래로 내리는 함수
  const scrollToBottomAuto = useCallback(() => {
    virtuosoRef.current?.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: "auto" })
  }, [])

  // 수동 스크롤 (버튼 클릭 시)
  const scrollToBottomManual = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: 'LAST',
      behavior: 'smooth',
    })
    setShowScrollToBottom(false)
    disableAutoScrollRef.current = false
  }, [])

  // 자동 스크롤 일시 중지
  const pauseAutoScroll = useCallback(() => {
    disableAutoScrollRef.current = true
    setShowScrollToBottom(true)
  }, [])

  return {
    virtuosoRef,
    scrollContainerRef,
    isAtBottom,
    showScrollToBottom,
    handleScroll,
    scrollToBottomAuto,
    scrollToBottomSmooth,
    scrollToBottomManual,
    pauseAutoScroll,
    disableAutoScrollRef
  }
}
