import React from "react"

/**
 * uc544uc774ucf58 uc0c9uc0c1 ud0c0uc785 uc815uc758
 */
export type IconColor = "default" | "info" | "success" | "warning" | "error"

/**
 * uc544uc774ucf58 uc0c9uc0c1uc744 CSS uac12uc73cub85c ubcc0ud658
 */
export function getIconColor(color: IconColor): string {
	switch (color) {
		case "info":
			return "var(--vscode-charts-blue)"
		case "success":
			return "var(--vscode-charts-green)"
		case "warning":
			return "var(--vscode-charts-yellow)"
		case "error":
			return "var(--vscode-charts-red)"
		default:
			return "var(--vscode-foreground)"
	}
}

/**
 * JSX uc0acuc6a9ud560 uc218 uc5c6uc73cubbc0ub85c getIconPropsub85c ubcc0uacbd
 */
export function getIconProps(iconName: string, color: IconColor = "default") {
	return {
		className: `codicon codicon-${iconName}`,
		style: {
			color: getIconColor(color),
			marginRight: 6,
		}
	}
}

/**
 * ub3c4uad6c uc774ub984uc5d0 ub530ub77c uc54cub9deuc740 uc544uc774ucf58 uc774ub984 ubc18ud658
 */
export function getToolIcon(name: string): string {
	switch (name.toLowerCase()) {
		case "find_by_name":
			return "search"
		case "grep_search":
			return "search"
		case "codebase_search":
			return "search"
		case "edit_file":
			return "edit"
		case "write_to_file":
			return "add"
		case "run_command":
			return "terminal"
		case "view_file":
			return "file"
		case "view_line_range":
			return "file"
		case "search_web":
			return "globe"
		case "read_url_content":
			return "globe"
		case "get_available_memory_ids":
			return "database"
		case "get_all_memories":
			return "database"
		case "browser_preview":
			return "browser"
		default:
			return "tools"
	}
}
