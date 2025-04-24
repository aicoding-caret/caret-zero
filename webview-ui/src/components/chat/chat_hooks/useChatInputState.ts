import { useState, useRef, RefObject } from 'react'

/**
 * ucc44ud305 uc785ub825 uc0c1ud0dc uad00ub9acub97c uc704ud55c ucee4uc2a4ud140 ud6c5
 * - ud14duc2a4ud2b8 uc785ub825 uad00ub9ac
 * - uc774ubbf8uc9c0 uc120ud0dd uad00ub9ac
 * - ud14duc2a4ud2b8 uc601uc5ed ud65cuc131ud654/ube44ud65cuc131ud654 uad00ub9ac
 */
export function useChatInputState() {
  // uc785ub825 uad00ub828 uc0c1ud0dc
  const [inputValue, setInputValue] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [textAreaDisabled, setTextAreaDisabled] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  // uc785ub825ucc3d ucd08uae30ud654
  const resetInput = () => {
    setInputValue("")
    setSelectedImages([])
    setTextAreaDisabled(false)
  }

  // uc785ub825ucc3d ube44ud65cuc131ud654
  const disableInput = (disable: boolean = true) => {
    setTextAreaDisabled(disable)
  }

  // uc774ubbf8uc9c0 ucd94uac00
  const addImage = (imagePath: string) => {
    setSelectedImages((prev) => [...prev, imagePath])
  }

  // uc774ubbf8uc9c0 uc81cuac70
  const removeImage = (imagePath: string) => {
    setSelectedImages((prev) => prev.filter((path) => path !== imagePath))
  }

  // uc785ub825ucc3d ud3ecucee4uc2a4
  const focusTextArea = () => {
    textAreaRef.current?.focus()
  }

  return {
    inputValue,
    setInputValue,
    textAreaRef,
    textAreaDisabled,
    setTextAreaDisabled,
    selectedImages,
    setSelectedImages,
    resetInput,
    disableInput,
    addImage,
    removeImage,
    focusTextArea,
  }
}
