import { useMemo } from 'react'
import { CaretMessage, CaretSayBrowserAction } from '../../../../../src/shared/ExtensionMessage'

/**
 * ub8e8uc6b0uc800 uc138uc158 uc0c1ud0dc uad00ub9acub97c uc704ud55c ucee4uc2a4ud140 ud6c5
 * - uba54uc2dcuc9c0ub97c ub8e8uc6b0uc800 uc138uc158uc73cub85c uadf8ub8f9ud654
 * - ub8e8uc6b0uc800 uc138uc158 uba54uc2dcuc9c0 ud655uc778 ubc29ubc95 uc81cuacf5
 */
export function useBrowserSessionState(messages: CaretMessage[]) {
  // uba54uc2dcuc9c0uac00 ub8e8uc6b0uc800 uc138uc158uc5d0 uc18cuc18duc778uc9c0 ud655uc778
  const isBrowserSessionMessage = (message: CaretMessage): boolean => {
    if (message.type === "ask") {
      return ["browser_action_launch"].includes(message.ask!)
    }
    if (message.type === "say") {
      return [
        "browser_action_launch", 
        "api_req_started", 
        "text", 
        "browser_action", 
        "browser_action_result"
      ].includes(message.say!)
    }
    return false
  }

  // uba54uc2dcuc9c0ub97c uc138uc158 ub2e8uc704ub85c uadf8ub8f9ud654
  const groupedMessages = useMemo(() => {
    const result: (CaretMessage | CaretMessage[])[] = []
    let currentGroup: CaretMessage[] = []
    let isInBrowserSession = false

    // ud604uc7ac uadf8ub8f9uc744 uc885ub8cc
    const endBrowserSession = () => {
      if (currentGroup.length > 0) {
        result.push([...currentGroup])
        currentGroup = []
        isInBrowserSession = false
      }
    }

    messages.forEach((message) => {
      // ub8e8uc6b0uc800 uc138uc158 uc2dcuc791 uba54uc2dcuc9c0
      if (message.ask === "browser_action_launch" || message.say === "browser_action_launch") {
        endBrowserSession() // uc774uc804 uc138uc158 uc885ub8cc
        isInBrowserSession = true
        currentGroup.push(message)
      } 
      // ud604uc7ac uadf8ub8f9uc5d0 uc788ub294 uacbd uc6b0 ucc98ub9ac
      else if (isInBrowserSession) {
        if (message.say === "api_req_started") {
          const lastApiReqStarted = [...currentGroup].reverse().find(m => m.say === "api_req_started")
          if (lastApiReqStarted?.text !== null) {
            try {
              const info = JSON.parse(lastApiReqStarted.text)
              if (info.cancelReason !== null) {
                endBrowserSession()
                result.push(message)
                return
              }
            } catch (e) {
              console.error("Failed to parse API Req Info for grouping:", lastApiReqStarted.text, e)
            }
          }
        }

        if (isBrowserSessionMessage(message)) {
          currentGroup.push(message)
          if (message.say === "browser_action") {
            try {
              const browserAction = JSON.parse(message.text || "{}") as CaretSayBrowserAction
              if (browserAction.action === "close") {
                endBrowserSession()
              }
            } catch (e) {
              console.error("Failed to parse browser action:", message.text, e)
            }
          }
        } else {
          endBrowserSession()
          result.push(message)
        }
      } 
      // uc77cub860 uba54uc2dcuc9c0
      else {
        result.push(message)
      }
    })

    // ub9c8uc9c0ub9c9 uadf8ub8f9 ucc98ub9ac
    if (currentGroup.length > 0) {
      result.push([...currentGroup])
    }

    return result
  }, [messages])

  return {
    groupedMessages,
    isBrowserSessionMessage,
  }
}
