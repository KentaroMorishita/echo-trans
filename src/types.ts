export type TranslationHistory = {
  original: string
  translated: string
  timestamp: Date
  isEditing: boolean
}

export type SortOrder = "newest" | "oldest"
