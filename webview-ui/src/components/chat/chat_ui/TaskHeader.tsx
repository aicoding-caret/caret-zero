import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { memo, useEffect, useMemo, useRef, useState } from "react"
import { useWindowSize } from "react-use"
import { mentionRegexGlobal } from "../../../../../src/shared/context-mentions"
import { CaretMessage } from "../../../../../src/shared/ExtensionMessage"
import { useExtensionState } from "../../../context/ExtensionStateContext"
import { formatLargeNumber, formatSize } from "../../../utils/format"
import { vscode } from "../../../utils/vscode"
import Thumbnails from "../../common/Thumbnails"
import { normalizeApiConfiguration } from "../../settings/ApiOptions"

interface TaskHeaderProps {
	task: CaretMessage
	tokensIn: number
	tokensOut: number
	doesModelSupportPromptCache: boolean
	cacheWrites?: number
	cacheReads?: number
	totalCost: number
	lastApiReqTotalTokens?: number
	onClose: () => void
}
