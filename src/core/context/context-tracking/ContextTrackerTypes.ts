// Type definitions for FileContextTracker
export interface FileMetadataEntry {
	path: string
	record_state: "active" | "stale"
	record_source: "read_tool" | "user_edited" | "caret_edited" | "file_mentioned"
	caret_read_date: number | null
	caret_edit_date: number | null
	user_edit_date?: number | null
}

export interface ModelMetadataEntry {
	ts: number
	model_id: string
	model_provider_id: string
	mode: string
}

export interface TaskMetadata {
	files_in_context: FileMetadataEntry[]
	model_usage: ModelMetadataEntry[]
}
