import React from 'react'
import styled from 'styled-components'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

interface ChatButtonsProps {
  primaryButtonText?: string
  secondaryButtonText?: string
  enableButtons: boolean
  isStreaming: boolean
  didClickCancel: boolean
  onPrimaryClick: () => void
  onSecondaryClick: () => void
}

/**
 * ucc44ud305 ud654uba74 ud558ub2e8uc5d0 ud45cuc2dcub418ub294 ubc84ud2bc ucef4ud3ecub10cud2b8
 * - uae30ubcf8 ubc84ud2bc (Approve/Reject ub4f1)
 * - uc2a4ud2b8ub9acubc0d uc911 ubc84ud2bc (Cancel)
 * - ubc84ud2bc ud65cuc131ud654/ube44ud65cuc131ud654 uc0c1ud0dc ucc98ub9ac
 */
const ChatButtons: React.FC<ChatButtonsProps> = ({
  primaryButtonText,
  secondaryButtonText,
  enableButtons,
  isStreaming,
  didClickCancel,
  onPrimaryClick,
  onSecondaryClick
}) => {
  return (
    <ButtonContainer
      opacity={
        primaryButtonText || secondaryButtonText || isStreaming
          ? enableButtons || (isStreaming && !didClickCancel)
            ? 1
            : 0.5
          : 0
      }
      padding={`${primaryButtonText || secondaryButtonText || isStreaming ? "10" : "0"}px 15px 0px 15px`}
    >
      {primaryButtonText && !isStreaming && (
        <VSCodeButton
          appearance="primary"
          disabled={!enableButtons}
          style={{ flex: secondaryButtonText ? 1 : 2, marginRight: secondaryButtonText ? "6px" : "0" }}
          onClick={onPrimaryClick}
        >
          {primaryButtonText}
        </VSCodeButton>
      )}
      
      {(secondaryButtonText || isStreaming) && (
        <VSCodeButton
          appearance="secondary"
          disabled={!enableButtons && !(isStreaming && !didClickCancel)}
          style={{ flex: isStreaming ? 2 : 1, marginLeft: isStreaming ? 0 : "6px" }}
          onClick={onSecondaryClick}
        >
          {isStreaming ? "Cancel" : secondaryButtonText}
        </VSCodeButton>
      )}
    </ButtonContainer>
  )
}

const ButtonContainer = styled.div<{ opacity: number, padding: string }>`
  opacity: ${props => props.opacity};
  display: flex;
  padding: ${props => props.padding};
`

export default ChatButtons
