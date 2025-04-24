import { useState, useRef, useCallback, RefObject } from 'react'
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

  // 자동 스크롤 (새 메시지가 추가될 때)
  const scrollToBottomAuto = useCallback(() => {
    if (disableAutoScrollRef.current) return
    virtuosoRef.current?.scrollToIndex({
      index: 'LAST',
      behavior: 'smooth',
    })
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

  // 사용자가 스크롤업 할 때 자동 스크롤 비활성화
  const pauseAutoScroll = useCallback(() => {
    disableAutoScrollRef.current = true
  }, [])

  return {
    virtuosoRef,
    scrollContainerRef,
    isAtBottom,
    showScrollToBottom,
    handleScroll,
    scrollToBottomAuto,
    scrollToBottomManual,
    pauseAutoScroll,
  }
}
