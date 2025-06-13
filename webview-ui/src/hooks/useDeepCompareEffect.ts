import { useEffect, useRef } from "react"
import isEqual from "lodash/isEqual"

export function useDeepCompareEffect<T extends any[]>(
	callback: () => void | (() => void),
	dependencies: T
) {
	const currentDepsRef = useRef<T>()

	if (!isEqual(currentDepsRef.current, dependencies)) {
		currentDepsRef.current = dependencies
	}

	useEffect(callback, [currentDepsRef.current])
}

export function useCustomCompareEffect<T extends any[]>(
	callback: () => void | (() => void),
	dependencies: T,
	comparator: (prevDeps: T | undefined, nextDeps: T) => boolean
) {
	const currentDepsRef = useRef<T>()

	if (!comparator(currentDepsRef.current, dependencies)) {
		currentDepsRef.current = dependencies
	}

	useEffect(callback, [currentDepsRef.current])
} 