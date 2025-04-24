import { useState, useMemo } from 'react'
import { findLast } from '../../../../../src/shared/array'
import {
  CaretMessage,
  CaretApiReqInfo
} from '../../../../../src/shared/ExtensionMessage'
import { combineApiRequests } from '../../../../../src/shared/combineApiRequests'
import { combineCommandSequences } from '../../../../../src/shared/combineCommandSequences'
import { getApiMetrics } from '../../../../../src/shared/getApiMetrics'

/**
 * 채팅 메시지 상태 관리를 위한 커스텀 훅
 * - 메시지 확장/축소 상태 관리
 * - 메시지 변환 및 결합
 * - API 메트릭 계산
 */
export function useMessageState(messages: CaretMessage[]) {
  // 메시지 확장/축소 상태 관리
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  // 첫 번째 메시지는 task, 나머지는 대화 내용
  const task = useMemo(() => messages.at(0), [messages])
  
  // 메시지 결합 및 변환 (API 요청 및 명령어 시퀀스 결합)
  const modifiedMessages = useMemo(
    () => combineApiRequests(combineCommandSequences(messages.slice(1))),
    [messages]
  )

  // API 메트릭 계산 (토큰 수 등)
  const apiMetrics = useMemo(
    () => getApiMetrics(modifiedMessages),
    [modifiedMessages]
  )

  // 마지막 API 요청의 총 토큰 수 계산
  const lastApiReqTotalTokens = useMemo(() => {
    const getTotalTokensFromApiReqMessage = (msg: CaretMessage) => {
      if (!msg.text) return 0
      try {
        const { tokensIn, tokensOut, cacheWrites, cacheReads }: CaretApiReqInfo = JSON.parse(msg.text)
        return (tokensIn || 0) + (tokensOut || 0) + (cacheWrites || 0) + (cacheReads || 0)
      } catch (e) {
        console.error("Failed to parse API Req Info:", msg.text, e)
        return 0
      }
    }
    
    const lastApiReqMessage = findLast(modifiedMessages, (msg) => {
      if (msg.say !== "api_req_started") return false
      return getTotalTokensFromApiReqMessage(msg) > 0
    })
    
    if (!lastApiReqMessage) return undefined
    return getTotalTokensFromApiReqMessage(lastApiReqMessage)
  }, [modifiedMessages])

  // 메시지 확장/축소 토글 함수
  const toggleExpand = (messageTs: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [messageTs]: !prev[messageTs],
    }))
  }

  // 특정 메시지가 확장되었는지 확인하는 함수
  const isExpanded = (messageTs: number) => {
    return !!expandedRows[messageTs]
  }

  return {
    task,
    modifiedMessages,
    apiMetrics,
    lastApiReqTotalTokens,
    isExpanded,
    toggleExpand,
  }
}
