import React from 'react'
import styled from 'styled-components'

interface ScrollControlsProps {
  showScrollToBottom: boolean
  onScrollToBottom: () => void
}

/**
 * ucc44ud305 ud654uba74uc758 uc2a4ud06cub864 ucee8ud2b8ub864 ucef4ud3ecub10cud2b8
 * - "ucc44ud305 ubc14ub2e5uc73cub85c" uc2a4ud06cub864 ubc84ud2bc ud45cuc2dc
 * - uc2a4ud06cub864 ucc98ub9ac ub85cuc9c1 uc81cuacf5
 */
const ScrollControls: React.FC<ScrollControlsProps> = ({ showScrollToBottom, onScrollToBottom }) => {
  if (!showScrollToBottom) return null
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '120px',
        right: '15px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      <ScrollToBottomButton onClick={onScrollToBottom}>
        <span className="codicon codicon-chevron-down" style={{ fontSize: "18px" }}></span>
      </ScrollToBottomButton>
    </div>
  )
}

const ScrollToBottomButton = styled.div`
  background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 55%, transparent);
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  height: 25px;
  width: 25px;

  &:hover {
    background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 90%, transparent);
  }

  &:active {
    background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 70%, transparent);
  }
`

export default ScrollControls
