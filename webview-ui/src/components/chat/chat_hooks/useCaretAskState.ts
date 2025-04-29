import { useState, useMemo, useEffect } from 'react'
import { CaretMessage, CaretAsk, CaretSayTool } from '../../../../../src/shared/ExtensionMessage'

/**
 * ucc44ud305 uba54uc2dcuc9c0 ud0c0uc785uc5d0 ub530ub978 uc0c1ud0dc uad00ub9acub97c uc704ud55c ucee4uc2a4ud140 ud6c5
 * - uba54uc2dcuc9c0 ud0c0uc785uc5d0 ub530ub978 ubc84ud2bc uc0c1ud0dc uad00ub9ac
 * - uc785ub825ucc3d ud65cuc131ud654/ube44ud65cuc131ud654 uad00ub9ac
 * - ub9c8uc9c0ub9c9 uba54uc2dcuc9c0 uc0c1ud0dc ucd94uc801
 */
export function useCaretAskState(
  messages: CaretMessage[],
  setTextAreaDisabled: (disabled: boolean) => void,
  resetInput: (isPartial: boolean) => void
) {
  // ucc44ud305 ubc84ud2bc uad00ub828 uc0c1ud0dc
  const [caretAsk, setCaretAsk] = useState<CaretAsk | undefined>(undefined)
  const [enableButtons, setEnableButtons] = useState<boolean>(false)
  const [primaryButtonText, setPrimaryButtonText] = useState<string | undefined>("Approve")
  const [secondaryButtonText, setSecondaryButtonText] = useState<string | undefined>("Reject")
  const [didClickCancel, setDidClickCancel] = useState(false)

  // ub9c8uc9c0ub9c9 uba54uc2dcuc9c0uc640 uadf8 uc804 uba54uc2dcuc9c0 ucd94ucd9c
  const lastMessage = useMemo(() => messages.at(-1), [messages])
  const secondLastMessage = useMemo(() => messages.at(-2), [messages])

  // ub9c8uc9c0ub9c9 uba54uc2dcuc9c0 ubcc0uacbduc2dc uc0c1ud0dc uc5c5ub370uc774ud2b8
  useEffect(() => {
    if (!lastMessage) return

    const updateState = () => {
      if (lastMessage.type === "ask") {
        const isPartial = lastMessage.partial === true
        
        switch (lastMessage.ask) {
          case "api_req_failed":
            setTextAreaDisabled(true)
            setCaretAsk("api_req_failed")
            setEnableButtons(true)
            setPrimaryButtonText("Retry")
            setSecondaryButtonText("Start New Task")
            break
            
          case "mistake_limit_reached":
            setTextAreaDisabled(false)
            setCaretAsk("mistake_limit_reached")
            setEnableButtons(true)
            setPrimaryButtonText("Proceed Anyways")
            setSecondaryButtonText("Start New Task")
            break
            
          case "auto_approval_max_req_reached":
            setTextAreaDisabled(true)
            setCaretAsk("auto_approval_max_req_reached")
            setEnableButtons(true)
            setPrimaryButtonText("Proceed")
            setSecondaryButtonText("Start New Task")
            break
            
          case "followup":
          case "plan_mode_respond":
            setTextAreaDisabled(isPartial)
            setCaretAsk(lastMessage.ask)
            setEnableButtons(true)
            break
            
          case "tool":
            setTextAreaDisabled(isPartial)
            setCaretAsk("tool")
            setEnableButtons(!isPartial)
            try {
              const tool = JSON.parse(lastMessage.text || "{}") as CaretSayTool
              switch (tool.tool) {
                case "editedExistingFile":
                case "newFileCreated":
                  setPrimaryButtonText("Save")
                  setSecondaryButtonText("Reject")
                  break
                default:
                  setPrimaryButtonText("Approve")
                  setSecondaryButtonText("Reject")
                  break
              }
            } catch (e) {
              console.error("Failed to parse tool ask:", lastMessage.text, e)
              setPrimaryButtonText("Approve")
              setSecondaryButtonText("Reject")
            }
            break
            
          case "browser_action_launch":
            setTextAreaDisabled(isPartial)
            setCaretAsk("browser_action_launch")
            setEnableButtons(!isPartial)
            setPrimaryButtonText("Approve")
            setSecondaryButtonText("Reject")
            break
            
          case "command":
            setTextAreaDisabled(isPartial)
            setCaretAsk("command")
            setEnableButtons(!isPartial)
            setPrimaryButtonText("Run Command")
            setSecondaryButtonText("Reject")
            break
            
          case "command_output":
            setTextAreaDisabled(false)
            setCaretAsk("command_output")
            setEnableButtons(true)
            setPrimaryButtonText("Proceed While Running")
            setSecondaryButtonText(undefined)
            break
            
          case "use_mcp_server":
            setTextAreaDisabled(isPartial)
            setCaretAsk("use_mcp_server")
            setEnableButtons(!isPartial)
            setPrimaryButtonText("Approve")
            setSecondaryButtonText("Reject")
            break
            
          case "completion_result":
            setTextAreaDisabled(isPartial)
            setCaretAsk("completion_result")
            setEnableButtons(!isPartial)
            setPrimaryButtonText("Start New Task")
            setSecondaryButtonText(undefined)
            break
            
          case "resume_task":
            setTextAreaDisabled(false)
            setCaretAsk("resume_task")
            setEnableButtons(true)
            setPrimaryButtonText("Resume Task")
            setSecondaryButtonText(undefined)
            setDidClickCancel(false)
            break
            
          case "resume_completed_task":
            setTextAreaDisabled(false)
            setCaretAsk("resume_completed_task")
            setEnableButtons(true)
            setPrimaryButtonText("Start New Task")
            setSecondaryButtonText(undefined)
            setDidClickCancel(false)
            break
        }
      } else if (lastMessage.type === "say") {
        switch (lastMessage.say) {
          case "api_req_started":
            if (secondLastMessage?.ask === "command_output") {
              resetInput(true)
              setCaretAsk(undefined)
              setEnableButtons(false)
            }
            break
            
          case "task":
          case "error":
          case "api_req_finished":
          case "text":
          case "browser_action":
          case "browser_action_result":
          case "browser_action_launch":
          case "command":
          case "use_mcp_server":
          case "command_output":
          case "mcp_server_request_started":
          case "mcp_server_response":
          case "completion_result":
          case "tool":
            // uae30ubcf8uc801uc73cub85c ud2b9ubcc4ud55c ucc98ub9acuac00 ud544uc694ud558uc9c0 uc54auc740 uba54uc2dcuc9c0 ud0c0uc785ub4e4
            break
        }
      }
    }

    updateState()
  }, [lastMessage, secondLastMessage, setTextAreaDisabled, resetInput])

  // ucde8uc18c ubc84ud2bc ud074ub9ad uc0c1ud0dc uc81cuc5b4
  const handleCancel = () => {
    setDidClickCancel(true)
  }

  // ubc84ud2bc uc0c1ud0dc ucd08uae30ud654
  const resetButtonsState = () => {
    setCaretAsk(undefined)
    setEnableButtons(false)
    setPrimaryButtonText("Approve")
    setSecondaryButtonText("Reject")
    setDidClickCancel(false)
  }

  return {
    caretAsk,
    enableButtons,
    primaryButtonText,
    secondaryButtonText,
    didClickCancel,
    handleCancel,
    resetButtonsState,
  }
}
