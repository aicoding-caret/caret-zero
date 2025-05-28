// import React from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import DynamicTextArea from "react-textarea-autosize"
import { useClickAway, useEvent, useWindowSize } from "react-use"
import styled from "styled-components"
import { mentionRegex, mentionRegexGlobal } from "@shared/context-mentions"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { useExtensionState } from "@/context/ExtensionStateContext"
import {
	ContextMenuOptionType,
	getContextMenuOptions,
	insertMention,
	insertMentionDirectly,
	removeMention,
	shouldShowContextMenu,
	SearchResult,
} from "@/utils/context-mentions"
import {
	SlashCommand,
	slashCommandDeleteRegex,
	shouldShowSlashCommandsMenu,
	getMatchingSlashCommands,
	insertSlashCommand,
	removeSlashCommand,
	validateSlashCommand,
} from "@/utils/slash-commands"
import { useMetaKeyDetection, useShortcut } from "@/utils/hooks"
import { validateApiConfiguration, validateModelId } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import { EmptyRequest } from "@shared/proto/common"
import { FileServiceClient, StateServiceClient } from "@/services/grpc-client"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import Thumbnails from "@/components/common/Thumbnails"
import Tooltip from "@/components/common/Tooltip"
import ApiOptions, { normalizeApiConfiguration } from "@/components/settings/ApiOptions"
import { MAX_IMAGES_PER_MESSAGE } from "@/components/chat/ChatView"
import ContextMenu from "@/components/chat/ContextMenu"
import SlashCommandMenu from "@/components/chat/SlashCommandMenu"
import { ChatMode, ChatSettings } from "@shared/ChatSettings"
import ServersToggleModal from "./ServersToggleModal"
import CaretRulesToggleModal from "../caret-rules/CaretRulesToggleModal"

const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => {
			if (img.naturalWidth > 7500 || img.naturalHeight > 7500) {
				reject(new Error("Image dimensions exceed maximum allowed size of 7500px."))
			} else {
				resolve({ width: img.naturalWidth, height: img.naturalHeight })
			}
		}
		img.onerror = (err) => {
			console.error("Failed to load image for dimension check:", err)
			reject(new Error("Failed to load image to check dimensions."))
		}
		img.src = dataUrl
	})
}

interface ChatTextAreaProps {
	inputValue: string
	activeQuote: string | null
	setInputValue: (value: string) => void
	sendingDisabled: boolean
	placeholderText: string
	selectedImages: string[]
	setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>
	onSend: () => void
	onSelectImages: () => void
	shouldDisableImages: boolean
	onHeightChange?: (height: number) => void
	onShowSettings?: () => void // Prop for settings button click
	onFocusChange?: (isFocused: boolean) => void
}

interface GitCommit {
	type: ContextMenuOptionType.Git
	value: string
	label: string
	description: string
}

const PLAN_MODE_COLOR = "var(--vscode-inputValidation-warningBorder)"

const SwitchContainer = styled.div<{ disabled: boolean }>`
	display: flex;
	align-items: center;
	background-color: var(--vscode-editor-background);
	border: 1px solid var(--vscode-input-border);
	border-radius: 12px;
	overflow: hidden;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};
	transform: scale(0.85);
	transform-origin: right center;
	margin-left: -10px;
	user-select: none;
`

const Slider = styled.div<{ mode: ChatMode }>`
	position: absolute;
	height: 100%;
	width: 20%;
	background-color: var(--vscode-focusBorder);
	transition: transform 0.2s ease;
	transform: translateX(${(props) => {
		switch (props.mode) {
			case 'arch': return '0%';
			case 'dev': return '100%';
			case 'rule': return '200%';
			case 'talk': return '300%';
			case 'custom': return '400%';
			default: return '0%';
		}
	}});
`

const SwitchOption = styled.div<{ isActive: boolean }>`
	padding: 2px 8px;
	color: ${(props) => (props.isActive ? "white" : "var(--vscode-input-foreground)")};
	z-index: 1;
	transition: color 0.2s ease;
	font-size: 12px;
	width: 20%;
	text-align: center;
	min-width: 40px;
	flex: 1;

	&:hover {
		background-color: ${(props) => (!props.isActive ? "var(--vscode-toolbar-hoverBackground)" : "transparent")};
	}
`

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

const ModelDisplayButton = styled.a<{ $isActive?: boolean; disabled?: boolean }>`
	padding: 0px 0px;
	height: 20px;
	width: 100%;
	min-width: 0;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	text-decoration: ${(props) => (props.$isActive ? "underline" : "none")};
	color: ${(props) => (props.$isActive ? "var(--vscode-foreground)" : "var(--vscode-descriptionForeground)")};
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
			activeQuote,
			setInputValue,
			sendingDisabled,
			placeholderText,
			selectedImages,
			setSelectedImages,
			onSend,
			onSelectImages,
			shouldDisableImages,
			onHeightChange,
			onFocusChange,
			onShowSettings, // Destructure the new prop
		},
		ref,
	) => {
		const { filePaths, chatSettings, apiConfiguration, openRouterModels, platform, workflowToggles, availableModes} = useExtensionState()
		const [isTextAreaFocused, setIsTextAreaFocused] = useState(false)
		const [isDraggingOver, setIsDraggingOver] = useState(false)
		const [gitCommits, setGitCommits] = useState<GitCommit[]>([])

		const [showSlashCommandsMenu, setShowSlashCommandsMenu] = useState(false)
		const [selectedSlashCommandsIndex, setSelectedSlashCommandsIndex] = useState(0)
		const [slashCommandsQuery, setSlashCommandsQuery] = useState("")
		const slashCommandsMenuContainerRef = useRef<HTMLDivElement>(null)

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
		const [justDeletedSpaceAfterSlashCommand, setJustDeletedSpaceAfterSlashCommand] = useState(false)
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
		const [shownTooltipMode, setShownTooltipMode] = useState<ChatSettings["mode"] | null>(null)
		const [pendingInsertions, setPendingInsertions] = useState<string[]>([])
		const shiftHoldTimerRef = useRef<NodeJS.Timeout | null>(null)
		const [showUnsupportedFileError, setShowUnsupportedFileError] = useState(false)
		const unsupportedFileTimerRef = useRef<NodeJS.Timeout | null>(null)
		const [showDimensionError, setShowDimensionError] = useState(false)
		const dimensionErrorTimerRef = useRef<NodeJS.Timeout | null>(null)

		const [fileSearchResults, setFileSearchResults] = useState<SearchResult[]>([])
		const [searchLoading, setSearchLoading] = useState(false)
		const [, metaKeyChar] = useMetaKeyDetection(platform)

		// Add a ref to track previous menu state
		const prevShowModelSelector = useRef(showModelSelector)

		// Fetch git commits when Git is selected or when typing a hash
		useEffect(() => {
			if (selectedType === ContextMenuOptionType.Git || /^[a-f0-9]+$/i.test(searchQuery)) {
				vscode.postMessage({ type: "searchCommits", text: searchQuery || "" })
				FileServiceClient.searchCommits({ value: searchQuery || "" })
					.then((response) => {
						if (response.commits) {
							const commits: GitCommit[] = response.commits.map(
								(commit: { hash: string; shortHash: string; subject: string; author: string; date: string }) => ({
									type: ContextMenuOptionType.Git,
									value: commit.hash,
									label: commit.subject,
									description: `${commit.shortHash} by ${commit.author} on ${commit.date}`,
								}),
							)
							setGitCommits(commits)
						}
					})
					.catch((error) => {
						console.error("Error searching commits:", error)
					})
			}
		}, [selectedType, searchQuery])

		const handleMessage = useCallback((event: MessageEvent) => {
			const message: ExtensionMessage = event.data
			switch (message.type) {
				case "fileSearchResults": {
					// Only update results if they match the current query or if there's no mentionsRequestId - better UX
					if (!message.mentionsRequestId || message.mentionsRequestId === currentSearchQueryRef.current) {
						setFileSearchResults(message.results || [])
						setSearchLoading(false)
					}
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

		useEffect(() => {
			const handleClickOutsideSlashMenu = (event: MouseEvent) => {
				if (
					slashCommandsMenuContainerRef.current &&
					!slashCommandsMenuContainerRef.current.contains(event.target as Node)
				) {
					setShowSlashCommandsMenu(false)
				}
			}

			if (showSlashCommandsMenu) {
				document.addEventListener("mousedown", handleClickOutsideSlashMenu)
			}

			return () => {
				document.removeEventListener("mousedown", handleClickOutsideSlashMenu)
			}
		}, [showSlashCommandsMenu])

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

		const handleSlashCommandsSelect = useCallback(
			(command: SlashCommand) => {
				setShowSlashCommandsMenu(false)

				if (textAreaRef.current) {
					const { newValue, commandIndex } = insertSlashCommand(textAreaRef.current.value, command.name)
					const newCursorPosition = newValue.indexOf(" ", commandIndex + 1 + command.name.length) + 1

					setInputValue(newValue)
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
			[setInputValue],
		)

		const handleKeyDown = useCallback(
			(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
				if (showSlashCommandsMenu) {
					if (event.key === "Escape") {
						setShowSlashCommandsMenu(false)
						return
					}

					if (event.key === "ArrowUp" || event.key === "ArrowDown") {
						event.preventDefault()
						setSelectedSlashCommandsIndex((prevIndex) => {
							const direction = event.key === "ArrowUp" ? -1 : 1
							// Get commands with workflow toggles
							const allCommands = getMatchingSlashCommands(slashCommandsQuery, workflowToggles)

							if (allCommands.length === 0) {
								return prevIndex
							}

							// Calculate total command count
							const totalCommandCount = allCommands.length

							// Create wraparound navigation - moves from last item to first and vice versa
							const newIndex = (prevIndex + direction + totalCommandCount) % totalCommandCount
							return newIndex
						})
						return
					}

					if ((event.key === "Enter" || event.key === "Tab") && selectedSlashCommandsIndex !== -1) {
						event.preventDefault()
						const commands = getMatchingSlashCommands(slashCommandsQuery, workflowToggles)
						if (commands.length > 0) {
							handleSlashCommandsSelect(commands[selectedSlashCommandsIndex])
						}
						return
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
							const options = getContextMenuOptions(searchQuery, selectedType, queryItems, fileSearchResults)
							const optionsLength = options.length

							if (optionsLength === 0) return prevIndex

							// Find selectable options (non-URL types)
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
						const selectedOption = getContextMenuOptions(searchQuery, selectedType, queryItems, fileSearchResults)[
							selectedMenuIndex
						]
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

					if (!sendingDisabled) {
						setIsTextAreaFocused(false)
						onSend()
					}
				}
				if (event.key === "Backspace" && !isComposing) {
					const charBeforeCursor = inputValue[cursorPosition - 1]
					const charAfterCursor = inputValue[cursorPosition + 1]
					const charBeforeIsWhitespace =
						charBeforeCursor === " " || charBeforeCursor === "\n" || charBeforeCursor === "\r\n"
					const charAfterIsWhitespace =
						charAfterCursor === " " || charAfterCursor === "\n" || charAfterCursor === "\r\n"

					// Check if we're right after a space that follows a mention or slash command
					if (
						charBeforeIsWhitespace &&
						inputValue.slice(0, cursorPosition - 1).match(new RegExp(mentionRegex.source + "$"))
					) {
						// File mention handling
						const newCursorPosition = cursorPosition - 1
						if (!charAfterIsWhitespace) {
							event.preventDefault()
							textAreaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
							setCursorPosition(newCursorPosition)
						}
						setCursorPosition(newCursorPosition)
						setJustDeletedSpaceAfterMention(true)
						setJustDeletedSpaceAfterSlashCommand(false)
					} else if (charBeforeIsWhitespace && inputValue.slice(0, cursorPosition - 1).match(slashCommandDeleteRegex)) {
						// New slash command handling
						const newCursorPosition = cursorPosition - 1
						if (!charAfterIsWhitespace) {
							event.preventDefault()
							textAreaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
							setCursorPosition(newCursorPosition)
						}
						setCursorPosition(newCursorPosition)
						setJustDeletedSpaceAfterSlashCommand(true)
						setJustDeletedSpaceAfterMention(false)
					}
					// Handle the second backspace press for mentions or slash commands
					else if (justDeletedSpaceAfterMention) {
						const { newText, newPosition } = removeMention(inputValue, cursorPosition)
						if (newText !== inputValue) {
							event.preventDefault()
							setInputValue(newText)
							setIntendedCursorPosition(newPosition)
						}
						setJustDeletedSpaceAfterMention(false)
						setShowContextMenu(false)
					} else if (justDeletedSpaceAfterSlashCommand) {
						// New slash command deletion
						const { newText, newPosition } = removeSlashCommand(inputValue, cursorPosition)
						if (newText !== inputValue) {
							event.preventDefault()
							setInputValue(newText)
							setIntendedCursorPosition(newPosition)
						}
						setJustDeletedSpaceAfterSlashCommand(false)
						setShowSlashCommandsMenu(false)
					}
					// Default case - reset flags if none of the above apply
					else {
						setJustDeletedSpaceAfterMention(false)
						setJustDeletedSpaceAfterSlashCommand(false)
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
				showSlashCommandsMenu,
				selectedSlashCommandsIndex,
				slashCommandsQuery,
				handleSlashCommandsSelect,
				sendingDisabled,
			],
		)

		// Effect to set cursor position after state updates
		useLayoutEffect(() => {
			if (intendedCursorPosition !== null && textAreaRef.current) {
				textAreaRef.current.setSelectionRange(intendedCursorPosition, intendedCursorPosition)
				setIntendedCursorPosition(null) // Reset the state after applying
			}
		}, [inputValue, intendedCursorPosition])

		useEffect(() => {
			if (pendingInsertions.length === 0 || !textAreaRef.current) {
				return
			}

			const path = pendingInsertions[0]
			const currentTextArea = textAreaRef.current
			const currentValue = currentTextArea.value
			const currentCursorPos =
				intendedCursorPosition ??
				(currentTextArea.selectionStart >= 0 ? currentTextArea.selectionStart : currentValue.length)

			const { newValue, mentionIndex } = insertMentionDirectly(currentValue, currentCursorPos, path)

			setInputValue(newValue)

			const newCursorPosition = mentionIndex + path.length + 2
			setIntendedCursorPosition(newCursorPosition)

			setPendingInsertions((prev) => prev.slice(1))
		}, [pendingInsertions, setInputValue])

		const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

		const currentSearchQueryRef = useRef<string>("")

		const handleInputChange = useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				const newValue = e.target.value
				const newCursorPosition = e.target.selectionStart
				setInputValue(newValue)
				setCursorPosition(newCursorPosition)
				let showMenu = shouldShowContextMenu(newValue, newCursorPosition)
				const showSlashCommandsMenu = shouldShowSlashCommandsMenu(newValue, newCursorPosition)

				// we do not allow both menus to be shown at the same time
				// the slash commands menu has precedence bc its a narrower component
				if (showSlashCommandsMenu) {
					showMenu = false
				}

				setShowSlashCommandsMenu(showSlashCommandsMenu)
				setShowContextMenu(showMenu)

				if (showSlashCommandsMenu) {
					const slashIndex = newValue.indexOf("/")
					const query = newValue.slice(slashIndex + 1, newCursorPosition)
					setSlashCommandsQuery(query)
					setSelectedSlashCommandsIndex(0)
				} else {
					setSlashCommandsQuery("")
					setSelectedSlashCommandsIndex(0)
				}

				if (showMenu) {
					const lastAtIndex = newValue.lastIndexOf("@", newCursorPosition - 1)
					const query = newValue.slice(lastAtIndex + 1, newCursorPosition)
					setSearchQuery(query)
					currentSearchQueryRef.current = query

					if (query.length > 0 && !selectedType) {
						setSelectedMenuIndex(0)

						// Clear any existing timeout
						if (searchTimeoutRef.current) {
							clearTimeout(searchTimeoutRef.current)
						}

						setSearchLoading(true)

						// Set a timeout to debounce the search requests
						searchTimeoutRef.current = setTimeout(() => {
							FileServiceClient.searchFiles({
								query: query,
								mentionsRequestId: query,
							})
								.then((results) => {
									setFileSearchResults(results.results || [])
									setSearchLoading(false)
								})
								.catch((error) => {
									console.error("Error searching files:", error)
									setFileSearchResults([])
									setSearchLoading(false)
								})
						}, 200) // 200ms debounce
					} else {
						setSelectedMenuIndex(3) // Set to "File" option by default
					}
				} else {
					setSearchQuery("")
					setSelectedMenuIndex(-1)
					setFileSearchResults([])
				}
			},
			[setInputValue, setFileSearchResults, selectedType],
		)

		useEffect(() => {
			if (!showContextMenu) setSelectedType(null)
		}, [showContextMenu])

		const handleBlur = useCallback(() => {
			// Only hide the context menu if the user didn't click on it
			if (!isMouseDownOnMenu) {
				setShowContextMenu(false)
				setShowSlashCommandsMenu(false)
			}
			setIsTextAreaFocused(false)
			onFocusChange?.(false) // Call prop on blur
		}, [isMouseDownOnMenu, onFocusChange])

		const showDimensionErrorMessage = useCallback(() => {
			setShowDimensionError(true)
			if (dimensionErrorTimerRef.current) {
				clearTimeout(dimensionErrorTimerRef.current)
			}
			dimensionErrorTimerRef.current = setTimeout(() => {
				setShowDimensionError(false)
				dimensionErrorTimerRef.current = null
			}, 3000)
		}, [])

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
					const imagePromises = imageItems.map((item) => {
						return new Promise<string | null>((resolve) => {
							const blob = item.getAsFile()
							if (!blob) {
								resolve(null)
								return
							}
							const reader = new FileReader()
							reader.onloadend = async () => {
								if (reader.error) {
									console.error("Error reading file:", reader.error)
									resolve(null)
									return
								} 
								const result = reader.result
								if (typeof result === "string") {
									try {
										await getImageDimensions(result)
										resolve(result)
									} catch (error) {
										console.warn((error as Error).message)
										showDimensionErrorMessage()
										resolve(null)
									}
								} else {
									resolve(null)
								}
							
								// const reader = new FileReader()
								// reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null)
								reader.onerror = () => resolve(null)
								reader.readAsDataURL(blob)
							}
					})
				})
					const imageDataArray = await Promise.all(imagePromises)
					const dataUrls = imageDataArray.filter((url): url is string => url !== null)
					if (dataUrls.length > 0){
						 setSelectedImages((prev) => [...prev, ...dataUrls].slice(0, MAX_IMAGES_PER_MESSAGE))
					}
					else { 
					console.warn("No valid images were processed from paste.")
					}
				}
			},
			[shouldDisableImages, setSelectedImages, cursorPosition, setInputValue, inputValue, showDimensionErrorMessage],
		)

		const handleThumbnailsHeightChange = useCallback((height: number) => setThumbnailsHeight(height), [])
		useEffect(() => {
			if (selectedImages.length === 0) setThumbnailsHeight(0)
		}, [selectedImages])
		const handleMenuMouseDown = useCallback(() => setIsMouseDownOnMenu(true), [])

		const updateHighlights = useCallback(() => {
			if (!textAreaRef.current || !highlightLayerRef.current) return

			let processedText = textAreaRef.current.value

			processedText = processedText
				.replace(/\n$/, "\n\n")
				.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] || c)
				// highlight @mentions
				.replace(mentionRegexGlobal, '<mark class="mention-context-textarea-highlight">$&</mark>')

			// check for highlighting /slash-commands
			if (/^\s*\//.test(processedText)) {
				const slashIndex = processedText.indexOf("/")

				// end of command is end of text or first whitespace
				const spaceIndex = processedText.indexOf(" ", slashIndex)
				const endIndex = spaceIndex > -1 ? spaceIndex : processedText.length

				// extract and validate the exact command text
				const commandText = processedText.substring(slashIndex + 1, endIndex)
				const isValidCommand = validateSlashCommand(commandText, workflowToggles)

				if (isValidCommand) {
					const fullCommand = processedText.substring(slashIndex, endIndex) // includes slash

					const highlighted = `<mark class="mention-context-textarea-highlight">${fullCommand}</mark>`
					processedText = processedText.substring(0, slashIndex) + highlighted + processedText.substring(endIndex)
				}
			}

			highlightLayerRef.current.innerHTML = processedText
			highlightLayerRef.current.scrollTop = textAreaRef.current.scrollTop
			highlightLayerRef.current.scrollLeft = textAreaRef.current.scrollLeft
		}, [workflowToggles])

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

		const submitApiConfig = useCallback(() => {
			const apiValidationResult = validateApiConfiguration(apiConfiguration)
			const modelIdValidationResult = validateModelId(apiConfiguration, openRouterModels)
			if (!apiValidationResult && !modelIdValidationResult)
				vscode.postMessage({ type: "apiConfiguration", apiConfiguration })
			else vscode.postMessage({ type: "getLatestState" })
		}, [apiConfiguration, openRouterModels])

		// Removed onModeToggle function

		// const handleContextButtonClick = useCallback(() => {
		// 	if (textAreaDisabled) return
		// 	} else {
		// 		StateServiceClient.getLatestState(EmptyRequest.create())
		// 			.then(() => {
		// 				console.log("State refreshed")
		// 			})
		// 			.catch((error) => {
		// 				console.error("Error refreshing state:", error)
		// 			})
		// 	}
		// }, [apiConfiguration, openRouterModels])

		const onModeToggle = useCallback((newMode: ChatMode) => {
			// 1. 로컬 상태 즉시 업데이트
			vscode.postMessage({
				type: "updateSettings",
				chatSettings: { ...chatSettings, mode: newMode },
			});

			let changeModeDelay = 0;
			if (showModelSelector) {
				submitApiConfig();
				changeModeDelay = 250; // API 설정 업데이트 대기
			}
			
			setTimeout(() => {
				// 2. API 호출
				StateServiceClient.togglePlanActMode({
					chatSettings: {
						mode: newMode,
					},
					chatContent: {
						message: inputValue.trim() ? inputValue : undefined,
						images: selectedImages.length > 0 ? selectedImages : undefined,
					},
				}).catch(error => {
					console.error("Error updating chat mode:", error);
					// 3. 실패 시 상태 롤백
					vscode.postMessage({
						type: "updateSettings",
						chatSettings: { ...chatSettings, mode: chatSettings.mode },
					});
				});
				
				// 모드 전환 후 텍스트 영역 포커스
				setTimeout(() => {
					textAreaRef.current?.focus();
				}, 100);
			}, changeModeDelay);
		}, [showModelSelector, submitApiConfig, inputValue, selectedImages, chatSettings]);

		useShortcut("Meta+Shift+a", () => onModeToggle(chatSettings.mode), { disableTextInputs: false }) // important that we don't disable the text input here

		const handleContextButtonClick = useCallback(() => {
			// Focus the textarea first
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
		}, [inputValue, handleInputChange, updateHighlights])

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
				case "caret":
					return `${selectedProvider}:${selectedModelId}`
				case "openai":
					return `openai-compat:${selectedModelId}`
				case "vscode-lm":
					return `vscode-lm:${apiConfiguration.vsCodeLmModelSelector ? `${apiConfiguration.vsCodeLmModelSelector.vendor ?? ""}/${apiConfiguration.vsCodeLmModelSelector.family ?? ""}` : unknownModel}`
				case "together":
					return `${selectedProvider}:${apiConfiguration.togetherModelId}`
				case "fireworks":
					return `fireworks:${apiConfiguration.fireworksModelId}`
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

		// Function to show error message for unsupported files for drag and drop
		const showUnsupportedFileErrorMessage = () => {
			// Show error message for unsupported files
			setShowUnsupportedFileError(true)

			// Clear any existing timer
			if (unsupportedFileTimerRef.current) {
				clearTimeout(unsupportedFileTimerRef.current)
			}

			// Set timer to hide error after 3 seconds
			unsupportedFileTimerRef.current = setTimeout(() => {
				setShowUnsupportedFileError(false)
				unsupportedFileTimerRef.current = null
			}, 3000)
		}

		const handleDragEnter = (e: React.DragEvent) => {
			e.preventDefault()
			setIsDraggingOver(true)

			// Check if files are being dragged
			if (e.dataTransfer.types.includes("Files")) {
				// Check if any of the files are not images
				const items = Array.from(e.dataTransfer.items)
				const hasNonImageFile = items.some((item) => {
					if (item.kind === "file") {
						const type = item.type.split("/")[0]
						return type !== "image"
					}
					return false
				})

				if (hasNonImageFile) {
					showUnsupportedFileErrorMessage()
				}
			}
		}
		/**
		 * Handles the drag over event to allow dropping.
		 * Prevents the default behavior to enable drop.
		 *
		 * @param {React.DragEvent} e - The drag event.
		 */
		const onDragOver = (e: React.DragEvent) => {
			e.preventDefault()
			// Ensure state remains true if dragging continues over the element
			if (!isDraggingOver) {
				setIsDraggingOver(true)
			}
		}

		const handleDragLeave = (e: React.DragEvent) => {
			e.preventDefault()
			// Check if the related target is still within the drop zone; prevents flickering
			const dropZone = e.currentTarget as HTMLElement
			if (!dropZone.contains(e.relatedTarget as Node)) {
				setIsDraggingOver(false)
				// Don't clear the error message here, let it time out naturally
			}
		}

		// Effect to detect when drag operation ends outside the component
		useEffect(() => {
			const handleGlobalDragEnd = () => {
				// This will be triggered when the drag operation ends anywhere
				setIsDraggingOver(false)
				// Don't clear error message, let it time out naturally
			}

			document.addEventListener("dragend", handleGlobalDragEnd)

			return () => {
				document.removeEventListener("dragend", handleGlobalDragEnd)
			}
		}, [])

		/**
		 * Handles the drop event for files and text.
		 * Processes dropped images and text, updating the state accordingly.
		 *
		 * @param {React.DragEvent} e - The drop event.
		 */
		const onDrop = async (e: React.DragEvent) => {
			e.preventDefault()
			setIsDraggingOver(false) // Reset state on drop

			// Clear any error message when something is actually dropped
			setShowUnsupportedFileError(false)
			if (unsupportedFileTimerRef.current) {
				clearTimeout(unsupportedFileTimerRef.current)
				unsupportedFileTimerRef.current = null
			}

			// --- 1. VSCode Explorer Drop Handling ---
			let uris: string[] = []
			const resourceUrlsData = e.dataTransfer.getData("resourceurls")
			const vscodeUriListData = e.dataTransfer.getData("application/vnd.code.uri-list")

			// 1a. Try 'resourceurls' first (used for multi-select)
			if (resourceUrlsData) {
				try {
					uris = JSON.parse(resourceUrlsData)
					uris = uris.map((uri) => decodeURIComponent(uri))
				} catch (error) {
					console.error("Failed to parse resourceurls JSON:", error)
					uris = [] // Reset if parsing failed
				}
			}

			// 1b. Fallback to 'application/vnd.code.uri-list' (newline separated)
			if (uris.length === 0 && vscodeUriListData) {
				uris = vscodeUriListData.split("\n").map((uri) => uri.trim())
			}

			// 1c. Filter for valid schemes (file or vscode-file) and non-empty strings
			const validUris = uris.filter((uri) => uri && (uri.startsWith("vscode-file:") || uri.startsWith("file:")))

			if (validUris.length > 0) {
				setPendingInsertions([])
				let initialCursorPos = inputValue.length
				if (textAreaRef.current) {
					initialCursorPos = textAreaRef.current.selectionStart
				}
				setIntendedCursorPosition(initialCursorPos)

				FileServiceClient.getRelativePaths({ uris: validUris })
					.then((response) => {
						if (response.paths.length > 0) {
							setPendingInsertions((prev) => [...prev, ...response.paths])
						}
					})
					.catch((error) => {
						console.error("Error getting relative paths:", error)
					})
				return
			}

			const text = e.dataTransfer.getData("text")
			if (text) {
				handleTextDrop(text)
				return
			}

			// --- 3. Image Drop Handling ---
			// Only proceed if it wasn't a VSCode resource or plain text drop
			const files = Array.from(e.dataTransfer.files)
			const acceptedTypes = ["png", "jpeg", "webp"]
			const imageFiles = files.filter((file) => {
				const [type, subtype] = file.type.split("/")
				return type === "image" && acceptedTypes.includes(subtype)
			})

			if (shouldDisableImages || imageFiles.length === 0) {
				return
			}

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
							reader.onloadend = async () => {
								// Make async
								if (reader.error) {
									console.error("Error reading file:", reader.error)
									resolve(null)
								} else {
									const result = reader.result
									if (typeof result === "string") {
										try {
											await getImageDimensions(result) // Check dimensions
											resolve(result)
										} catch (error) {
											console.warn((error as Error).message)
											showDimensionErrorMessage() // Show error to user
											resolve(null) // Don't add this image
										}
									} else {
										resolve(null)
									}
								}
							}
							reader.onerror = () => resolve(null)
							reader.readAsDataURL(file)
						}),
				),
			)

		return (
			<div>
				<div
					style={{
						padding: "10px 15px",
						opacity: 1,
						position: "relative",
						display: "flex",
						// Drag-over styles moved to DynamicTextArea
						transition: "background-color 0.1s ease-in-out, border 0.1s ease-in-out",
					}}
					onDrop={onDrop}
					onDragOver={onDragOver}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}>
					{showDimensionError && (
						<div
							style={{
								position: "absolute",
								inset: "10px 15px",
								backgroundColor: "rgba(var(--vscode-errorForeground-rgb), 0.1)",
								border: "2px solid var(--vscode-errorForeground)",
								borderRadius: 2,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								zIndex: 10, // Ensure it's above other elements
								pointerEvents: "none",
							}}>
							<span
								style={{
									color: "var(--vscode-errorForeground)",
									fontWeight: "bold",
									fontSize: "12px",
									textAlign: "center",
								}}>
								Image dimensions exceed 7500px
							</span>
						</div>
					)}
					{showUnsupportedFileError && (
						<div
							style={{
								position: "absolute",
								inset: "10px 15px",
								backgroundColor: "rgba(var(--vscode-errorForeground-rgb), 0.1)",
								border: "2px solid var(--vscode-errorForeground)",
								borderRadius: 2,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								zIndex: 10,
								pointerEvents: "none",
							}}>
							<span
								style={{
									color: "var(--vscode-errorForeground)",
									fontWeight: "bold",
									fontSize: "12px",
								}}>
								Only image files are supported
							</span>
						</div>
					)}
					{showSlashCommandsMenu && (
						<div ref={slashCommandsMenuContainerRef}>
							<SlashCommandMenu
								onSelect={handleSlashCommandsSelect}
								selectedIndex={selectedSlashCommandsIndex}
								setSelectedIndex={setSelectedSlashCommandsIndex}
								onMouseDown={handleMenuMouseDown}
								query={slashCommandsQuery}
								workflowToggles={workflowToggles}
							/>
						</div>
					)}

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
								dynamicSearchResults={fileSearchResults}
								isLoading={searchLoading}
							/>
						</div>
					)}
					{!isTextAreaFocused && !activeQuote && (
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
						onChange={(e) => {
							handleInputChange(e)
							updateHighlights()
						}}
						onKeyDown={onKeyDown}
						onKeyUp={handleKeyUp}
						onFocus={() => {
							setIsTextAreaFocused(true)
							onFocusChange?.(true) // Call prop on focus
						}}
						onBlur={handleBlur}
						onPaste={handlePaste}
						onSelect={updateCursorPosition}
						onMouseUp={updateCursorPosition}
						onHeightChange={(height) => {
							if (textAreaBaseHeight === undefined || height < textAreaBaseHeight) setTextAreaBaseHeight(height)
							onHeightChange?.(height)
						}}
						placeholder={showUnsupportedFileError || showDimensionError ? "" : placeholderText}
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
							cursor: "text",
							flex: 1,
							zIndex: 1,
							outline:
								isDraggingOver && !showUnsupportedFileError // Only show drag outline if not showing error
									? "2px dashed var(--vscode-focusBorder)"
									: isTextAreaFocused
										? `1px solid var(--vscode-focusBorder)`
										: "none",
							outlineOffset: isDraggingOver && !showUnsupportedFileError ? "1px" : "0px", // Add offset for drag-over outline
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
							bottom: 9.5, // should be 10 but doesn't look good on mac
							zIndex: 2,
						}}>
						<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
							<div
								data-testid="send-button"
								className={`input-icon-button ${sendingDisabled ? "disabled" : ""} codicon codicon-send`}
								onClick={() => {
									if (!sendingDisabled) {
										setIsTextAreaFocused(false)
										onSend()
									}
								}}
								style={{ fontSize: 15 }}></div>
						</div>
					</div>
				</div>

				<ControlsContainer>
					{/* Always render both components, but control visibility with CSS */}
					{/* 항상 렌더링되지만 CSS로 가시성을 제어 */}
					<div
						style={{
							position: "relative",
							flex: 1,
							minWidth: 0,
							height: "28px", // 컨테이너 축소 방지를 위한 고정 높이
						}}>
						{/* 버튼 그룹 */}
						<ButtonGroup
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								transition: "opacity 0.3s ease-in-out",
								width: "100%",
								height: "100%",
								zIndex: 6,
							}}>
							{/* 컨텍스트 추가 버튼 */}
							<Tooltip tipText="Add Context" style={{ left: 0 }}>
								<VSCodeButton
									data-testid="context-button"
									appearance="icon"
									aria-label="Add Context"
									onClick={handleContextButtonClick}
									style={{ padding: "0px 0px", height: "20px" }}>
									<ButtonContainer>
										<span className="flex items-center" style={{ fontSize: "13px", marginBottom: 1 }}>
											@
										</span>
									</ButtonContainer>
								</VSCodeButton>
							</Tooltip>

							{/* 이미지 추가 버튼 */}
							<Tooltip tipText="Add Images">
								<VSCodeButton
									data-testid="images-button"
									appearance="icon"
									aria-label="Add Images"
									disabled={shouldDisableImages}
									onClick={() => {
										if (!shouldDisableImages) {
											onSelectImages();
										}
									}}
									style={{ padding: "0px 0px", height: "20px" }}>
									<ButtonContainer>
										<span
											className="codicon codicon-device-camera flex items-center"
											style={{ fontSize: "14px", marginBottom: -3 }}
										/>
									</ButtonContainer>
								</VSCodeButton>
							</Tooltip>

							{/* 추가 모달 버튼 */}
							<ServersToggleModal />
							<CaretRulesToggleModal />

							{/* 모델 선택 버튼 */}
							<ModelContainer ref={modelSelectorRef}>
								<ModelButtonWrapper ref={buttonRef}>
									<ModelDisplayButton
										role="button"
										$isActive={showModelSelector}
										disabled={false}
										title="Select Model / API Provider"
										onClick={handleModelButtonClick}
										tabIndex={0}>
										<ModelButtonContent>{modelDisplayName}</ModelButtonContent>
									</ModelDisplayButton>
								</ModelButtonWrapper>
								{showModelSelector && (
									<ModelSelectorTooltip
										arrowPosition={arrowPosition}
										menuPosition={menuPosition}
										style={{
											bottom: `calc(100vh - ${menuPosition}px + 6px)`,
										}}>
										<ApiOptions
											showModelOptions={true}
											apiErrorMessage={undefined}
											modelIdErrorMessage={undefined}
											isPopup={true}
											saveImmediately={true} // 팝업 즉시 저장
										/>
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
					</div>

					{/* 모드 전환 토글 */}
					<Tooltip
						style={{ zIndex: 1000 }}
						visible={shownTooltipMode !== null}
						tipText={`In ${shownTooltipMode} mode, Caret will ${getModeDescription(shownTooltipMode)}`}
						hintText={`Toggle w/ ${metaKeyChar}+Shift+A`}>
						<SwitchContainer data-testid="mode-switch" disabled={false}>
							<Slider mode={chatSettings.mode} />
							<SwitchOption 
								isActive={chatSettings.mode === "arch"}
								onClick={() => onModeToggle("arch")}
								onMouseOver={() => setShownTooltipMode("arch")}
								onMouseLeave={() => setShownTooltipMode(null)}>
								Arch
							</SwitchOption>
							<SwitchOption 
								isActive={chatSettings.mode === "dev"}
								onClick={() => onModeToggle("dev")}
								onMouseOver={() => setShownTooltipMode("dev")}
								onMouseLeave={() => setShownTooltipMode(null)}>
								Dev
							</SwitchOption>
							<SwitchOption 
								isActive={chatSettings.mode === "rule"}
								onClick={() => onModeToggle("rule")}
								onMouseOver={() => setShownTooltipMode("rule")}
								onMouseLeave={() => setShownTooltipMode(null)}>
								Rule
							</SwitchOption>
							<SwitchOption 
								isActive={chatSettings.mode === "talk"}
								onClick={() => onModeToggle("talk")}
								onMouseOver={() => setShownTooltipMode("talk")}
								onMouseLeave={() => setShownTooltipMode(null)}>
								Talk
							</SwitchOption>
							<SwitchOption 
								isActive={chatSettings.mode === "custom"}
								onClick={() => onModeToggle("custom")}
								onMouseOver={() => setShownTooltipMode("custom")}
								onMouseLeave={() => setShownTooltipMode(null)}>
								Custom
							</SwitchOption>
						</SwitchContainer>
					</Tooltip>

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

// 모드 설명을 반환하는 헬퍼 함수 추가
const getModeDescription = (mode: ChatMode | null): string => {
	if (!mode) return '';
	switch (mode) {
		case 'arch': return 'help architect and design solutions';
		case 'dev': return 'assist with development tasks';
		case 'rule': return 'enforce coding standards and rules';
		case 'talk': return 'engage in general discussion';
		case 'custom': return 'use custom behavior';
		default: return '';
	}
}

export default ChatTextArea
