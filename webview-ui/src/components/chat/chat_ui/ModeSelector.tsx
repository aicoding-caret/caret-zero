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
  flex-wrap: nowrap;
  justify-content: center;
  padding: 0 10px;
  margin-bottom: 8px;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const ModeButton = styled(VSCodeButton)`
  min-width: 0;
  flex: 1;
  white-space: nowrap;
  padding: 2px 4px 2px 4px !important;
  font-size: 11px !important;
  position: relative;
  height: 22px !important;
  
  &[data-shortcut]::after {
    content: attr(data-shortcut);
    position: absolute;
    top: -5px;
    right: 1px;
    font-size: 7px;
    opacity: 0.7;
  }
`

export default ModeSelector
