import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import DynamicTextArea from "react-textarea-autosize"
import { useClickAway, useEvent, useWindowSize } from "react-use"
import styled from "styled-components"
import { mentionRegex, mentionRegexGlobal } from "../../../../src/shared/context-mentions"
import { ExtensionMessage } from "../../../../src/shared/ExtensionMessage"
import { useExtensionState } from "../../context/ExtensionStateContext"
import {
	ContextMenuOptionType,
	getContextMenuOptions,
	insertMention,
	removeMention,
	shouldShowContextMenu,
} from "../../utils/context-mentions"
import { useMetaKeyDetection } from "../../utils/hooks" // Removed useShortcut
import { validateApiConfiguration, validateModelId } from "../../utils/validate"
import { vscode } from "../../utils/vscode"
import { CODE_BLOCK_BG_COLOR } from "../common/CodeBlock"
import Thumbnails from "../common/Thumbnails"
import ApiOptions, { normalizeApiConfiguration } from "../settings/ApiOptions"
import { MAX_IMAGES_PER_MESSAGE } from "./ChatView"
import ContextMenu from "./ContextMenu"
// Removed Tooltip and ChatSettings imports

interface ChatTextAreaProps {
	inputValue: string
	setInputValue: (value: string) => void
	textAreaDisabled: boolean
	placeholderText: string
	selectedImages: string[]
	setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>
	onSend: () => void
	onSelectImages: () => void
	shouldDisableImages: boolean
	onHeightChange?: (height: number) => void
	onShowSettings?: () => void // Prop for settings button click
}

// Define styled components for the new mode buttons
const ModeSelectorContainer = styled.div`
	display: flex;
	gap: 3px; /* Slightly reduce gap */
	flex-wrap: wrap;
	align-items: center; /* Align items vertically */
	margin-left: auto; /* Push buttons to the right */
	height: 20px; /* Match height with other controls */
`

const ModeButton = styled(VSCodeButton)`
	min-width: 35px; /* Make buttons smaller */
	height: 20px; /* Adjust height */
	font-size: calc(var(--vscode-font-size) - 2px); /* Make font smaller */
	&::part(control) {
		padding: 0 6px; /* Adjust padding */
		min-height: 20px; /* Adjust min-height */
		line-height: 20px; /* Center text vertically */
	}
	/* Add style for selected state */
	&[aria-pressed="true"] {
		/* Use aria-pressed for selected state */
		background-color: color-mix(in srgb, var(--vscode-button-background) 80%, black);
		/* Example: Use a different background or border for selected */
		/* border: 1px solid var(--vscode-focusBorder); */
	}
`

const SettingsButton = styled(VSCodeButton)`
	flex-shrink: 0;
	height: 20px; /* Match height */
	&::part(control) {
		padding: 0 5px; /* Adjust padding */
		min-width: auto;
		line-height: 20px; /* Center icon vertically */
	}
`

// Removed styled components related to the old Plan/Act toggle

const ButtonGroup = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	flex: 1;
	min-width: 0;
`

const ButtonContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 3px;
	font-size: 10px;
	white-space: nowrap;
	min-width: 0;
	width: 100%;
`

const ControlsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	/* margin-top: -5px; */ /* Removed negative margin */
	padding: 0px 8px 5px 8px; /* Adjust padding */
`

const ModelSelectorTooltip = styled.div<ModelSelectorTooltipProps>`
	position: fixed;
	bottom: calc(100% + 9px);
	left: 15px;
	right: 15px;
	background: ${CODE_BLOCK_BG_COLOR};
	border: 1px solid var(--vscode-editorGroup-border);
	padding: 12px;
	border-radius: 3px;
	z-index: 1000;
	max-height: calc(100vh - 100px);
	overflow-y: auto;
	overscroll-behavior: contain;

	// Add invisible padding for hover zone
	&::before {
		content: "";
		position: fixed;
		bottom: ${(props) => `calc(100vh - ${props.menuPosition}px - 2px)`};
		left: 0;
		right: 0;
		height: 8px;
	}

	// Arrow pointing down
	&::after {
		content: "";
		position: fixed;
		bottom: ${(props) => `calc(100vh - ${props.menuPosition}px)`};
		right: ${(props) => props.arrowPosition}px;
		width: 10px;
		height: 10px;
		background: ${CODE_BLOCK_BG_COLOR};
		border-right: 1px solid var(--vscode-editorGroup-border);
		border-bottom: 1px solid var(--vscode-editorGroup-border);
		transform: rotate(45deg);
		z-index: -1;
	}
`

const ModelContainer = styled.div`
	position: relative;
	display: flex;
	flex: 1;
	min-width: 0;
`

const ModelButtonWrapper = styled.div`
	display: inline-flex; // Make it shrink to content
	min-width: 0; // Allow shrinking
	max-width: 100%; // Don't overflow parent
`

const ModelDisplayButton = styled.a<{ isActive?: boolean; disabled?: boolean }>`
	padding: 0px 0px;
	height: 20px;
	width: 100%;
	min-width: 0;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	text-decoration: ${(props) => (props.isActive ? "underline" : "none")};
	color: ${(props) => (props.isActive ? "var(--vscode-foreground)" : "var(--vscode-descriptionForeground)")};
	display: flex;
	align-items: center;
	font-size: 10px;
	outline: none;
	user-select: none;
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};
	pointer-events: ${(props) => (props.disabled ? "none" : "auto")};

	&:hover,
	&:focus {
		color: ${(props) => (props.disabled ? "var(--vscode-descriptionForeground)" : "var(--vscode-foreground)")};
		text-decoration: ${(props) => (props.disabled ? "none" : "underline")};
		outline: none;
	}

	&:active {
		color: ${(props) => (props.disabled ? "var(--vscode-descriptionForeground)" : "var(--vscode-foreground)")};
		text-decoration: ${(props) => (props.disabled ? "none" : "underline")};
		outline: none;
	}

	&:focus-visible {
		outline: none;
	}
`

const ModelButtonContent = styled.div`
	width: 100%;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`

const ChatTextArea = forwardRef<HTMLTextAreaElement, ChatTextAreaProps>(
	(
		{
			inputValue,
			setInputValue,
			textAreaDisabled,
			placeholderText,
			selectedImages,
			setSelectedImages,
			onSend,
			onSelectImages,
			shouldDisableImages,
			onHeightChange,
			onShowSettings, // Destructure the new prop
		},
		ref,
	) => {
		const { filePaths, apiConfiguration, openRouterModels, platform, availableModes, chatSettings } = useExtensionState()

		// 디버그용 로그 - 상태 확인
		console.log("ChatTextArea loaded with modes:", availableModes?.map((m) => m.id).join(", "))
		const [isTextAreaFocused, setIsTextAreaFocused] = useState(false)
		const [gitCommits, setGitCommits] = useState<any[]>([])

		const [thumbnailsHeight, setThumbnailsHeight] = useState(0)
		const [textAreaBaseHeight, setTextAreaBaseHeight] = useState<number | undefined>(undefined)
		const [showContextMenu, setShowContextMenu] = useState(false)
		const [cursorPosition, setCursorPosition] = useState(0)
		const [searchQuery, setSearchQuery] = useState("")
		const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
		const [isMouseDownOnMenu, setIsMouseDownOnMenu] = useState(false)
		const highlightLayerRef = useRef<HTMLDivElement>(null)
		const [selectedMenuIndex, setSelectedMenuIndex] = useState(-1)
		const [selectedType, setSelectedType] = useState<ContextMenuOptionType | null>(null)
		const [justDeletedSpaceAfterMention, setJustDeletedSpaceAfterMention] = useState(false)
		const [intendedCursorPosition, setIntendedCursorPosition] = useState<number | null>(null)
		const contextMenuContainerRef = useRef<HTMLDivElement>(null)
		const [showModelSelector, setShowModelSelector] = useState(false)
		const modelSelectorRef = useRef<HTMLDivElement>(null)
		const { width: viewportWidth, height: viewportHeight } = useWindowSize()
		const buttonRef = useRef<HTMLDivElement>(null)
		const [arrowPosition, setArrowPosition] = useState(0)
		const [menuPosition, setMenuPosition] = useState(0)
		// Removed shownTooltipMode state

		// const [, metaKeyChar] = useMetaKeyDetection(platform); // Keep if shortcut is needed later
		const prevShowModelSelector = useRef(showModelSelector)

		// Fetch git commits when Git is selected or when typing a hash
		useEffect(() => {
			if (selectedType === ContextMenuOptionType.Git || /^[a-f0-9]+$/i.test(searchQuery)) {
				vscode.postMessage({ type: "searchCommits", text: searchQuery || "" })
			}
		}, [selectedType, searchQuery])

		const handleMessage = useCallback((event: MessageEvent) => {
			const message: ExtensionMessage = event.data
			switch (message.type) {
				case "commitSearchResults": {
					const commits =
						message.commits?.map((commit: any) => ({
							type: ContextMenuOptionType.Git,
							value: commit.hash,
							label: commit.subject,
							description: `${commit.shortHash} by ${commit.author} on ${commit.date}`,
						})) || []
					setGitCommits(commits)
					break
				}
			}
		}, [])

		useEvent("message", handleMessage)

		const queryItems = useMemo(() => {
			return [
				{ type: ContextMenuOptionType.Problems, value: "problems" },
				{ type: ContextMenuOptionType.Terminal, value: "terminal" },
				...gitCommits,
				...filePaths
					.map((file) => "/" + file)
					.map((path) => ({
						type: path.endsWith("/") ? ContextMenuOptionType.Folder : ContextMenuOptionType.File,
						value: path,
					})),
			]
		}, [filePaths, gitCommits])

		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (contextMenuContainerRef.current && !contextMenuContainerRef.current.contains(event.target as Node)) {
					setShowContextMenu(false)
				}
			}
			if (showContextMenu) {
				document.addEventListener("mousedown", handleClickOutside)
			}
			return () => {
				document.removeEventListener("mousedown", handleClickOutside)
			}
		}, [showContextMenu, setShowContextMenu])

		const handleMentionSelect = useCallback(
			(type: ContextMenuOptionType, value?: string) => {
				if (type === ContextMenuOptionType.NoResults) return
				if (
					type === ContextMenuOptionType.File ||
					type === ContextMenuOptionType.Folder ||
					type === ContextMenuOptionType.Git
				) {
					if (!value) {
						setSelectedType(type)
						setSearchQuery("")
						setSelectedMenuIndex(0)
						return
					}
				}
				setShowContextMenu(false)
				setSelectedType(null)
				if (textAreaRef.current) {
					let insertValue = value || ""
					if (type === ContextMenuOptionType.URL) insertValue = value || ""
					else if (type === ContextMenuOptionType.File || type === ContextMenuOptionType.Folder)
						insertValue = value || ""
					else if (type === ContextMenuOptionType.Problems) insertValue = "problems"
					else if (type === ContextMenuOptionType.Terminal) insertValue = "terminal"
					else if (type === ContextMenuOptionType.Git) insertValue = value || ""
					const { newValue, mentionIndex } = insertMention(textAreaRef.current.value, cursorPosition, insertValue)
					setInputValue(newValue)
					const newCursorPosition = newValue.indexOf(" ", mentionIndex + insertValue.length) + 1
					setCursorPosition(newCursorPosition)
					setIntendedCursorPosition(newCursorPosition)
					setTimeout(() => {
						if (textAreaRef.current) {
							textAreaRef.current.blur()
							textAreaRef.current.focus()
						}
					}, 0)
				}
			},
			[setInputValue, cursorPosition],
		)

		const onKeyDown = useCallback(
			(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
				const { key, ctrlKey, altKey, shiftKey, metaKey } = event

				// Ctrl+Enter로 메시지 전송
				if (ctrlKey && key === "Enter" && !altKey && !shiftKey && !metaKey) {
					event.preventDefault()
					onSend()
					return
				}

				// Alt + 숫자키 조합 처리 (모드 전환)
				if (!ctrlKey && altKey && !shiftKey && !metaKey) {
					// 숫자 키 체크 - 숫자 키보드 (1-9)
					const keyNum = parseInt(key)

					if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 9) {
						// 이벤트 전파 중단 - 이 부분을 주석 처리하여 이벤트가 상위로 전달되도록 함
						// event.stopPropagation();

						// 기본 동작만 방지(브라우저에서 Ctrl+숫자 단축키 처리 막기)
						event.preventDefault()
						console.log(`키 입력 감지: Ctrl+${keyNum} (TextArea 내부)`)

						// 모드 인덱스 계산 (0부터 시작)
						const modeIndex = keyNum - 1

						// 사용 가능한 모드 확인 및 범위 체크
						if (availableModes && modeIndex < availableModes.length && chatSettings) {
							const targetMode = availableModes[modeIndex].id

							// 현재 모드와 다른 경우에만 변경
							if (chatSettings.mode !== targetMode) {
								// VS Code API를 직접 사용하여 메시지 전송
								vscode.postMessage({
									type: "updateSettings",
									chatSettings: { ...chatSettings, mode: targetMode },
								})
								console.log(`모드 변경 요청: ${chatSettings.mode} -> ${targetMode}`)

								// 일정 시간 후 포커스 유지 - 이벤트 버블 끝나고 실행되도록
								setTimeout(() => {
									if (textAreaRef.current) {
										textAreaRef.current.focus()
									}
								}, 0)

								// 키 이벤트 처리 완료
								return
							}
						}
					}
				}
				if (showContextMenu) {
					if (event.key === "Escape") {
						setSelectedType(null)
						setSelectedMenuIndex(3)
						return
					}
					if (event.key === "ArrowUp" || event.key === "ArrowDown") {
						event.preventDefault()
						setSelectedMenuIndex((prevIndex) => {
							const direction = event.key === "ArrowUp" ? -1 : 1
							const options = getContextMenuOptions(searchQuery, selectedType, queryItems)
							if (options.length === 0) return prevIndex
							const selectableOptions = options.filter(
								(o) => o.type !== ContextMenuOptionType.URL && o.type !== ContextMenuOptionType.NoResults,
							)
							if (selectableOptions.length === 0) return -1
							const currentSelectableIndex = selectableOptions.findIndex((o) => o === options[prevIndex])
							const newSelectableIndex =
								(currentSelectableIndex + direction + selectableOptions.length) % selectableOptions.length
							return options.findIndex((o) => o === selectableOptions[newSelectableIndex])
						})
						return
					}
					if ((event.key === "Enter" || event.key === "Tab") && selectedMenuIndex !== -1) {
						event.preventDefault()
						const selectedOption = getContextMenuOptions(searchQuery, selectedType, queryItems)[selectedMenuIndex]
						if (
							selectedOption &&
							selectedOption.type !== ContextMenuOptionType.URL &&
							selectedOption.type !== ContextMenuOptionType.NoResults
						) {
							handleMentionSelect(selectedOption.type, selectedOption.value)
						}
						return
					}
				}
				const isComposing = event.nativeEvent?.isComposing ?? false
				if (event.key === "Enter" && !event.shiftKey && !isComposing) {
					event.preventDefault()
					setIsTextAreaFocused(false)
					onSend()
				}
				if (event.key === "Backspace" && !isComposing) {
					const charBeforeCursor = inputValue[cursorPosition - 1]
					const charAfterCursor = inputValue[cursorPosition + 1]
					const charBeforeIsWhitespace =
						charBeforeCursor === " " || charBeforeCursor === "\n" || charBeforeCursor === "\r\n"
					const charAfterIsWhitespace =
						charAfterCursor === " " || charAfterCursor === "\n" || charAfterCursor === "\r\n"
					if (
						charBeforeIsWhitespace &&
						inputValue.slice(0, cursorPosition - 1).match(new RegExp(mentionRegex.source + "$"))
					) {
						const newCursorPosition = cursorPosition - 1
						if (!charAfterIsWhitespace) {
							event.preventDefault()
							textAreaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
							setCursorPosition(newCursorPosition)
						}
						setCursorPosition(newCursorPosition)
						setJustDeletedSpaceAfterMention(true)
					} else if (justDeletedSpaceAfterMention) {
						const { newText, newPosition } = removeMention(inputValue, cursorPosition)
						if (newText !== inputValue) {
							event.preventDefault()
							setInputValue(newText)
							setIntendedCursorPosition(newPosition)
						}
						setJustDeletedSpaceAfterMention(false)
						setShowContextMenu(false)
					} else {
						setJustDeletedSpaceAfterMention(false)
					}
				}
			},
			[
				onSend,
				showContextMenu,
				searchQuery,
				selectedMenuIndex,
				handleMentionSelect,
				selectedType,
				inputValue,
				cursorPosition,
				setInputValue,
				justDeletedSpaceAfterMention,
				queryItems,
			],
		)

		useLayoutEffect(() => {
			if (intendedCursorPosition !== null && textAreaRef.current) {
				textAreaRef.current.setSelectionRange(intendedCursorPosition, intendedCursorPosition)
				setIntendedCursorPosition(null)
			}
		}, [inputValue, intendedCursorPosition])

		const handleInputChange = useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				const newValue = e.target.value
				const newCursorPosition = e.target.selectionStart
				setInputValue(newValue)
				setCursorPosition(newCursorPosition)
				const showMenu = shouldShowContextMenu(newValue, newCursorPosition)
				setShowContextMenu(showMenu)
				if (showMenu) {
					const lastAtIndex = newValue.lastIndexOf("@", newCursorPosition - 1)
					const query = newValue.slice(lastAtIndex + 1, newCursorPosition)
					setSearchQuery(query)
					setSelectedMenuIndex(query.length > 0 ? 0 : 3)
				} else {
					setSearchQuery("")
					setSelectedMenuIndex(-1)
				}
			},
			[setInputValue],
		)

		useEffect(() => {
			if (!showContextMenu) setSelectedType(null)
		}, [showContextMenu])

		const handleBlur = useCallback(() => {
			if (!isMouseDownOnMenu) setShowContextMenu(false)
			setIsTextAreaFocused(false)
		}, [isMouseDownOnMenu])

		const handlePaste = useCallback(
			async (e: React.ClipboardEvent) => {
				const items = e.clipboardData.items
				const pastedText = e.clipboardData.getData("text")
				const urlRegex = /^\S+:\/\/\S+$/
				if (urlRegex.test(pastedText.trim())) {
					e.preventDefault()
					const trimmedUrl = pastedText.trim()
					const newValue = inputValue.slice(0, cursorPosition) + trimmedUrl + " " + inputValue.slice(cursorPosition)
					setInputValue(newValue)
					const newCursorPosition = cursorPosition + trimmedUrl.length + 1
					setCursorPosition(newCursorPosition)
					setIntendedCursorPosition(newCursorPosition)
					setShowContextMenu(false)
					setTimeout(() => {
						if (textAreaRef.current) {
							textAreaRef.current.blur()
							textAreaRef.current.focus()
						}
					}, 0)
					return
				}
				const acceptedTypes = ["png", "jpeg", "webp"]
				const imageItems = Array.from(items).filter((item) => {
					const [type, subtype] = item.type.split("/")
					return type === "image" && acceptedTypes.includes(subtype)
				})
				if (!shouldDisableImages && imageItems.length > 0) {
					e.preventDefault()
					const imagePromises = imageItems.map(
						(item) =>
							new Promise<string | null>((resolve) => {
								const blob = item.getAsFile()
								if (!blob) {
									resolve(null)
									return
								}
								const reader = new FileReader()
								reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null)
								reader.onerror = () => resolve(null)
								reader.readAsDataURL(blob)
							}),
					)
					const imageDataArray = await Promise.all(imagePromises)
					const dataUrls = imageDataArray.filter((url): url is string => url !== null)
					if (dataUrls.length > 0) setSelectedImages((prev) => [...prev, ...dataUrls].slice(0, MAX_IMAGES_PER_MESSAGE))
					else console.warn("No valid images were processed from paste.")
				}
			},
			[shouldDisableImages, setSelectedImages, cursorPosition, setInputValue, inputValue],
		)

		const handleThumbnailsHeightChange = useCallback((height: number) => setThumbnailsHeight(height), [])
		useEffect(() => {
			if (selectedImages.length === 0) setThumbnailsHeight(0)
		}, [selectedImages])
		const handleMenuMouseDown = useCallback(() => setIsMouseDownOnMenu(true), [])

		const updateHighlights = useCallback(() => {
			if (!textAreaRef.current || !highlightLayerRef.current) return
			const text = textAreaRef.current.value
			highlightLayerRef.current.innerHTML = text
				.replace(/\n$/, "\n\n")
				.replace(/[<>&]/g, (c) => ({ "<": "<", ">": ">", "&": "&" })[c] || c)
				.replace(mentionRegexGlobal, '<mark class="mention-context-textarea-highlight">$&</mark>')
			highlightLayerRef.current.scrollTop = textAreaRef.current.scrollTop
			highlightLayerRef.current.scrollLeft = textAreaRef.current.scrollLeft
		}, [])

		useLayoutEffect(updateHighlights, [inputValue, updateHighlights])
		const updateCursorPosition = useCallback(() => {
			if (textAreaRef.current) setCursorPosition(textAreaRef.current.selectionStart)
		}, [])
		const handleKeyUp = useCallback(
			(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
				if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) updateCursorPosition()
			},
			[updateCursorPosition],
		)

		const submitApiConfig = useCallback(() => {
			const apiValidationResult = validateApiConfiguration(apiConfiguration)
			const modelIdValidationResult = validateModelId(apiConfiguration, openRouterModels)
			if (!apiValidationResult && !modelIdValidationResult)
				vscode.postMessage({ type: "apiConfiguration", apiConfiguration })
			else vscode.postMessage({ type: "getLatestState" })
		}, [apiConfiguration, openRouterModels])

		// Removed onModeToggle function

		const handleContextButtonClick = useCallback(() => {
			if (textAreaDisabled) return
			textAreaRef.current?.focus()
			if (!inputValue.trim()) {
				const event = { target: { value: "@", selectionStart: 1 } } as React.ChangeEvent<HTMLTextAreaElement>
				handleInputChange(event)
				updateHighlights()
				return
			}
			if (inputValue.endsWith(" ")) {
				const event = {
					target: { value: inputValue + "@", selectionStart: inputValue.length + 1 },
				} as React.ChangeEvent<HTMLTextAreaElement>
				handleInputChange(event)
				updateHighlights()
				return
			}
			const event = {
				target: { value: inputValue + " @", selectionStart: inputValue.length + 2 },
			} as React.ChangeEvent<HTMLTextAreaElement>
			handleInputChange(event)
			updateHighlights()
		}, [inputValue, textAreaDisabled, handleInputChange, updateHighlights])

		useEffect(() => {
			if (prevShowModelSelector.current && !showModelSelector) submitApiConfig()
			prevShowModelSelector.current = showModelSelector
		}, [showModelSelector, submitApiConfig])
		const handleModelButtonClick = () => setShowModelSelector(!showModelSelector)
		useClickAway(modelSelectorRef, () => setShowModelSelector(false))

		const modelDisplayName = useMemo(() => {
			const { selectedProvider, selectedModelId } = normalizeApiConfiguration(apiConfiguration)
			const unknownModel = "unknown"
			if (!apiConfiguration) return unknownModel
			switch (selectedProvider) {
				case "cline":
					return `${selectedProvider}:${selectedModelId}`
				case "openai":
					return `openai-compat:${selectedModelId}`
				case "vscode-lm":
					return `vscode-lm:${apiConfiguration.vsCodeLmModelSelector ? `${apiConfiguration.vsCodeLmModelSelector.vendor ?? ""}/${apiConfiguration.vsCodeLmModelSelector.family ?? ""}` : unknownModel}`
				case "together":
					return `${selectedProvider}:${apiConfiguration.togetherModelId}`
				case "lmstudio":
					return `${selectedProvider}:${apiConfiguration.lmStudioModelId}`
				case "ollama":
					return `${selectedProvider}:${apiConfiguration.ollamaModelId}`
				case "litellm":
					return `${selectedProvider}:${apiConfiguration.liteLlmModelId}`
				case "requesty":
				case "anthropic":
				case "openrouter":
				default:
					return `${selectedProvider}:${selectedModelId}`
			}
		}, [apiConfiguration])

		useEffect(() => {
			if (showModelSelector && buttonRef.current) {
				const buttonRect = buttonRef.current.getBoundingClientRect()
				const buttonCenter = buttonRect.left + buttonRect.width / 2
				const rightPosition = document.documentElement.clientWidth - buttonCenter - 5
				setArrowPosition(rightPosition)
				setMenuPosition(buttonRect.top + 1)
			}
		}, [showModelSelector, viewportWidth, viewportHeight])

		useEffect(() => {
			if (!showModelSelector) {
				const button = buttonRef.current?.querySelector("a")
				if (button) button.blur()
			}
		}, [showModelSelector])

		const onDragOver = (e: React.DragEvent) => e.preventDefault()
		const onDrop = async (e: React.DragEvent) => {
			e.preventDefault()
			const files = Array.from(e.dataTransfer.files)
			const text = e.dataTransfer.getData("text")
			if (text) {
				handleTextDrop(text)
				return
			}
			const acceptedTypes = ["png", "jpeg", "webp"]
			const imageFiles = files.filter((file) => {
				const [type, subtype] = file.type.split("/")
				return type === "image" && acceptedTypes.includes(subtype)
			})
			if (shouldDisableImages || imageFiles.length === 0) return
			const imageDataArray = await readImageFiles(imageFiles)
			const dataUrls = imageDataArray.filter((url): url is string => url !== null)
			if (dataUrls.length > 0) setSelectedImages((prev) => [...prev, ...dataUrls].slice(0, MAX_IMAGES_PER_MESSAGE))
			else console.warn("No valid images were processed from drop.")
		}
		const handleTextDrop = (text: string) => {
			const newValue = inputValue.slice(0, cursorPosition) + text + inputValue.slice(cursorPosition)
			setInputValue(newValue)
			const newCursorPosition = cursorPosition + text.length
			setCursorPosition(newCursorPosition)
			setIntendedCursorPosition(newCursorPosition)
		}
		const readImageFiles = (imageFiles: File[]): Promise<(string | null)[]> =>
			Promise.all(
				imageFiles.map(
					(file) =>
						new Promise<string | null>((resolve) => {
							const reader = new FileReader()
							reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null)
							reader.onerror = () => resolve(null)
							reader.readAsDataURL(file)
						}),
				),
			)

		return (
			<div>
				<div
					style={{ padding: "10px 15px", opacity: textAreaDisabled ? 0.5 : 1, position: "relative", display: "flex" }}
					onDrop={onDrop}
					onDragOver={onDragOver}>
					{showContextMenu && (
						<div ref={contextMenuContainerRef}>
							{" "}
							<ContextMenu
								onSelect={handleMentionSelect}
								searchQuery={searchQuery}
								onMouseDown={handleMenuMouseDown}
								selectedIndex={selectedMenuIndex}
								setSelectedIndex={setSelectedMenuIndex}
								selectedType={selectedType}
								queryItems={queryItems}
							/>{" "}
						</div>
					)}
					{!isTextAreaFocused && (
						<div
							style={{
								position: "absolute",
								inset: "10px 15px",
								border: "1px solid var(--vscode-input-border)",
								borderRadius: 2,
								pointerEvents: "none",
								zIndex: 5,
							}}
						/>
					)}
					<div
						ref={highlightLayerRef}
						style={{
							position: "absolute",
							top: 10,
							left: 15,
							right: 15,
							bottom: 10,
							pointerEvents: "none",
							whiteSpace: "pre-wrap",
							wordWrap: "break-word",
							color: "transparent",
							overflow: "hidden",
							backgroundColor: "var(--vscode-input-background)",
							fontFamily: "var(--vscode-font-family)",
							fontSize: "var(--vscode-editor-font-size)",
							lineHeight: "var(--vscode-editor-line-height)",
							borderRadius: 2,
							borderLeft: 0,
							borderRight: 0,
							borderTop: 0,
							borderColor: "transparent",
							borderBottom: `${thumbnailsHeight + 6}px solid transparent`,
							padding: "9px 28px 3px 9px",
						}}
					/>
					<DynamicTextArea
						data-testid="chat-input"
						ref={(el) => {
							if (typeof ref === "function") ref(el)
							else if (ref) ref.current = el
							textAreaRef.current = el
						}}
						value={inputValue}
						disabled={textAreaDisabled}
						onChange={(e) => {
							handleInputChange(e)
							updateHighlights()
						}}
						onKeyDown={onKeyDown}
						onKeyUp={handleKeyUp}
						onFocus={() => setIsTextAreaFocused(true)}
						onBlur={handleBlur}
						onPaste={handlePaste}
						onSelect={updateCursorPosition}
						onMouseUp={updateCursorPosition}
						onHeightChange={(height) => {
							if (textAreaBaseHeight === undefined || height < textAreaBaseHeight) setTextAreaBaseHeight(height)
							onHeightChange?.(height)
						}}
						placeholder={placeholderText}
						maxRows={10}
						autoFocus={true}
						style={{
							width: "100%",
							boxSizing: "border-box",
							backgroundColor: "transparent",
							color: "var(--vscode-input-foreground)",
							borderRadius: 2,
							fontFamily: "var(--vscode-font-family)",
							fontSize: "var(--vscode-editor-font-size)",
							lineHeight: "var(--vscode-editor-line-height)",
							resize: "none",
							overflowX: "hidden",
							overflowY: "scroll",
							scrollbarWidth: "none",
							borderLeft: 0,
							borderRight: 0,
							borderTop: 0,
							borderBottom: `${thumbnailsHeight + 6}px solid transparent`,
							borderColor: "transparent",
							padding: "9px 28px 3px 9px",
							cursor: textAreaDisabled ? "not-allowed" : undefined,
							flex: 1,
							zIndex: 1,
							outline: isTextAreaFocused ? `1px solid var(--vscode-focusBorder)` : "none",
						}}
						onScroll={updateHighlights}
					/>
					{selectedImages.length > 0 && (
						<Thumbnails
							images={selectedImages}
							setImages={setSelectedImages}
							onHeightChange={handleThumbnailsHeightChange}
							style={{ position: "absolute", paddingTop: 4, bottom: 14, left: 22, right: 47, zIndex: 2 }}
						/>
					)}
					<div
						style={{
							position: "absolute",
							right: 23,
							display: "flex",
							alignItems: "flex-center",
							height: textAreaBaseHeight || 31,
							bottom: 9.5,
							zIndex: 2,
						}}>
						<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
							<div
								data-testid="send-button"
								className={`input-icon-button ${textAreaDisabled ? "disabled" : ""} codicon codicon-send`}
								onClick={() => {
									if (!textAreaDisabled) {
										setIsTextAreaFocused(false)
										onSend()
									}
								}}
								style={{ fontSize: 15 }}></div>
						</div>
					</div>
				</div>

				<ControlsContainer>
					<ButtonGroup>
						<VSCodeButton
							data-testid="context-button"
							appearance="icon"
							aria-label="Add Context"
							disabled={textAreaDisabled}
							onClick={handleContextButtonClick}
							style={{ padding: "0px 0px", height: "20px" }}>
							<ButtonContainer>
								{" "}
								<span style={{ fontSize: "13px", marginBottom: 1 }}>@</span>{" "}
							</ButtonContainer>
						</VSCodeButton>
						<VSCodeButton
							data-testid="images-button"
							appearance="icon"
							aria-label="Add Images"
							disabled={shouldDisableImages}
							onClick={() => {
								if (!shouldDisableImages) onSelectImages()
							}}
							style={{ padding: "0px 0px", height: "20px" }}>
							<ButtonContainer>
								{" "}
								<span
									className="codicon codicon-device-camera"
									style={{ fontSize: "14px", marginBottom: -3 }}
								/>{" "}
							</ButtonContainer>
						</VSCodeButton>
						<ModelContainer ref={modelSelectorRef}>
							<ModelButtonWrapper ref={buttonRef}>
								<ModelDisplayButton
									role="button"
									isActive={showModelSelector}
									disabled={false}
									onClick={handleModelButtonClick}
									tabIndex={0}>
									<ModelButtonContent>{modelDisplayName}</ModelButtonContent>
								</ModelDisplayButton>
							</ModelButtonWrapper>
							{showModelSelector && (
								<ModelSelectorTooltip
									arrowPosition={arrowPosition}
									menuPosition={menuPosition}
									style={{ bottom: `calc(100vh - ${menuPosition}px + 6px)` }}>
									{" "}
									<ApiOptions
										showModelOptions={true}
										apiErrorMessage={undefined}
										modelIdErrorMessage={undefined}
										isPopup={true}
									/>{" "}
								</ModelSelectorTooltip>
							)}
						</ModelContainer>
					</ButtonGroup>
					{/* Replace the old Tooltip/SwitchContainer with the new ModeSelectorContainer */}
					<ModeSelectorContainer>
						{/* Example: Add state later to manage active button. Using aria-pressed for now. */}
						{/* Assuming 'Plan' is initially selected */}
						{/* 하단 모드 버튼을 제거하고 상단 모드 버튼으로 대체 */}
						{/* Settings button is removed from here, as it exists in the top bar */}
					</ModeSelectorContainer>
				</ControlsContainer>
			</div>
		)
	},
)

// Update TypeScript interface for styled-component props
interface ModelSelectorTooltipProps {
	arrowPosition: number
	menuPosition: number
}

export default ChatTextArea
