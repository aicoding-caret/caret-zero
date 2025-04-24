import React from 'react'
import styled from 'styled-components'
import { ApiProvider, ModelInfo } from '../../../../../src/shared/api'

interface ChatHeaderProps {
  task?: any
  telemetrySetting: string
  showAnnouncement: boolean
  version: string
  hideAnnouncement: () => void
  handleTaskCloseButtonClick: () => void
  apiMetrics: {
    totalTokensIn: number
    totalTokensOut: number
    totalCacheWrites?: number
    totalCacheReads?: number
    totalCost: number
  }
  lastApiReqTotalTokens?: number
  selectedProvider?: ApiProvider
  selectedModelInfo?: ModelInfo
}

/**
 * 채팅 화면 상단에 표시되는 헤더 컴포넌트
 * 태스크 모드일 때는 TaskHeader를 표시하고, 그렇지 않을 때는 안내 메시지를 표시함
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({
  task,
  telemetrySetting,
  showAnnouncement,
  version,
  hideAnnouncement,
  handleTaskCloseButtonClick,
  apiMetrics,
  lastApiReqTotalTokens,
  selectedProvider,
  selectedModelInfo
}) => {
  // 태스크 모드인 경우 TaskHeader 표시
  if (task) {
    return (
      <div>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleTaskCloseButtonClick} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              X
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 일반 모드인 경우 안내 메시지 표시
  return (
    <div>
      {telemetrySetting === "unset" && <div>텔레메트리 설정이 필요합니다</div>}
      {showAnnouncement && <div>공지사항 {version}</div>}
      <WelcomeContainer>
        <WelcomeContent>
          <h1>카렛 제로에 오신 것을 환영합니다!</h1>
          <p>
            다양한 프로그래밍 언어와 프레임워크를 지원하며, 코드 작성, 분석, 디버깅, 리팩토링을 도와드릴 수 있어요.
            일반 프로그래밍 질문이나 AI 개발에 대한 도움도 드릴 수 있어요!
          </p>
        </WelcomeContent>
      </WelcomeContainer>
    </div>
  )
}

// 스타일 컴포넌트
const WelcomeContainer = styled.div`
  margin: 20px 0;
  padding: 15px;
  border-radius: 6px;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-widget-border);
`

const WelcomeContent = styled.div`
  h1 {
    font-size: 1.2rem;
    margin-top: 0;
    margin-bottom: 10px;
    color: var(--vscode-foreground);
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.4;
    color: var(--vscode-foreground);
    opacity: 0.9;
  }
`

export default ChatHeader
