import { ReactNode } from "react"
import { CaretMessage } from "../../../../../src/shared/ExtensionMessage"

/**
 * ucc44ud305 ud589 ucef4ud3ecub10cud2b8 uacf5ud1b5 props
 */
export interface ChatRowProps {
	/** uba54uc2dcuc9c0 ub370uc774ud130 */
	message: CaretMessage
	/** ud655uc7a5 ubc84ud2bc uc0c1ud0dc */
	isExpanded: boolean
	/** ud655uc7a5 ubc84ud2bc ud074ub9ad uc774ubca4ud2b8 */
	onToggleExpand: () => void
	/** ub9c8uc9c0ub9c9uc73cub85c uc218uc815ub41c uba54uc2dcuc9c0 */
	lastModifiedMessage?: CaretMessage
	/** ub9c8uc9c0ub9c9 uba54uc2dcuc9c0uc778uc9c0 uc5ecubd80 */
	isLast: boolean
	/** uba54uc2dcuc9c0 ub192uc774 ubcc0uacbd uc774ubca4ud2b8 */
	onHeightChange: (isTaller: boolean) => void
}

/**
 * ucc44ud305 ud589 ub0b4uc6a9 ucef4ud3ecub10cud2b8 props (onHeightChange uc81cuc678)
 */
export interface ChatRowContentProps extends Omit<ChatRowProps, "onHeightChange"> {}

/**
 * uc544ubc14ud0c0 uc774ubbf8uc9c0 uad00ub828 uc815ubcf4 
 */
export interface AvatarInfo {
	/** ud504ub85cuD544 uc774ubbf8uc9c0 URL */
	profileUrl: string
	/** uc0acuac01uc911 uc774ubbf8uc9c0 URL */
	thinkingUrl: string
}
