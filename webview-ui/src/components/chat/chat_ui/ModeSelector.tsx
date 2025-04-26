import React from 'react'
import styled from 'styled-components'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { vscode } from '../../../utils/vscode'
import { ModeInfo } from '../../../../../src/shared/ExtensionMessage'

interface ModeSelectorProps {
  availableModes?: ModeInfo[]
  chatSettings: { mode: string; [key: string]: any }
}

/**
 * ucc44ud305 ubaa8ub4dc uc120ud0dd ucef4ud3ecub10cud2b8
 * - uc0acuc6a9 uac00ub2a5ud55c ubaa8ub4dc ubaa9ub85d ud45cuc2dc
 * - ud604uc7ac uc120ud0ddub41c ubaa8ub4dc ud45cuc2dc
 * - ud0a4ubcf4ub4dc ub2e8ucd95ud0a4 uc815ubcf4 ud45cuc2dc
 */
const ModeSelector: React.FC<ModeSelectorProps> = ({ availableModes, chatSettings }) => {
  // uae30ubcf8 ubaa8ub4dc uc815uc758 (uc11cubc84uc5d0uc11c ubaa8ub4dc ub370uc774ud130uac00 uc5c6uc744 uacbduc6b0 uc0acuc6a9)
  const fallbackModes = [
    { id: "arch", label: "Arch", shortcut: 1 },
    { id: "dev", label: "Dev", shortcut: 2 },
    { id: "rule", label: "Rule", shortcut: 3 },
    { id: "talk", label: "Talk", shortcut: 4 },
  ]

  // ubaa8ub4dc ubcc0uacbd ud568uc218
  const handleModeChange = (modeId: string) => {
    if (chatSettings.mode !== modeId) {
      vscode.postMessage({
        type: "updateSettings",
        chatSettings: { ...chatSettings, mode: modeId },
      })
    }
  }

  return (
    <ModeSelectorContainer>
      {availableModes && availableModes.length > 0 ? (
        // ubaa8ub4dc ub370uc774ud130uac00 uc788ub294 uacbduc6b0
        availableModes.map((modeInfo, index) => (
          <ModeButton
            key={modeInfo.id}
            appearance={chatSettings.mode === modeInfo.id ? "primary" : "secondary"}
            data-shortcut={`Alt+${index + 1}`}
            onClick={() => handleModeChange(modeInfo.id)}
          >
            {modeInfo.label || modeInfo.id}
          </ModeButton>
        ))
      ) : (
        // ubaa8ub4dc ub370uc774ud130uac00 uc5c6ub294 uacbduc6b0 uae30ubcf8 ubaa8ub4dc ubc84ud2bc ud45cuc2dc
        fallbackModes.map((fallbackMode) => (
          <ModeButton
            key={fallbackMode.id}
            appearance={chatSettings.mode === fallbackMode.id ? "primary" : "secondary"}
            data-shortcut={`Alt+${fallbackMode.shortcut}`}
            onClick={() => handleModeChange(fallbackMode.id)}
          >
            {fallbackMode.label}
          </ModeButton>
        ))
      )}
    </ModeSelectorContainer>
  )
}

const ModeSelectorContainer = styled.div`
  display: flex;
  gap: 3px;
  padding: 3px 5px;
  position: fixed;
  bottom: 8px;
  right: 8px;
  z-index: 100;
  background-color: var(--vscode-editor-background);
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &::-webkit-scrollbar {
    display: none;
  }
`

const ModeButton = styled(VSCodeButton)`
  min-width: 32px;
  height: 18px;
  white-space: nowrap;
  position: relative;
  
  &::part(control) {
    padding: 1px 4px;
    font-size: 0.8rem;
    line-height: 1;
  }
  
  &[data-shortcut]::after {
    content: attr(data-shortcut);
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--vscode-editor-background);
    color: var(--vscode-foreground);
    font-size: 9px;
    padding: 1px 3px;
    border-radius: 2px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover::after {
    opacity: 1;
  }
`

export default ModeSelector
