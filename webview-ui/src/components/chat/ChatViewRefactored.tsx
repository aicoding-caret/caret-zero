// 이 파일은 더 이상 사용하지 않습니다.
// 문제가 발생하여 원본 ChatView.tsx 파일로 복귀했습니다.
// 참고용으로만 유지됩니다.

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { useCallback, useEffect, useRef } from "react"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import styled from "styled-components"
import { useEvent } from "react-use"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import BrowserSessionRow from "./BrowserSessionRow"
import ChatRow from "./ChatRow"
import ChatTextArea from "./ChatTextArea"
import TaskHeader from "./TaskHeader"

// 추출한 Hook 임포트
import {
	useMessageState,
	useScrollControl,
	useChatInputState,
	useCaretAskState,
	useBrowserSessionState,
	useModeShortcuts
} from "./chat_hooks"

// 분리한 UI 컴포넌트 임포트
import ModeSelector from "./chat_ui/ModeSelector"
import ChatHeader from "./chat_ui/ChatHeader"
import ChatButtons from "./chat_ui/ChatButtons"
import ScrollControls from "./chat_ui/ScrollControls"

interface ChatViewProps {
	isHidden: boolean
	showAnnouncement: boolean
	hideAnnouncement: () => void
	showHistoryView: () => void
	onShowSettings: () => void
}

// 이 파일은 더 이상 사용하지 않습니다.
// 코드는 참고용으로만 유지됩니다.

export default () => <div>이 파일은 사용되지 않습니다</div>
