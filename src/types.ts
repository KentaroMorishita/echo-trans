export type setFromTextType = (text: string) => void
export type TranslationHistory = {
  original: string
  translated: string
  timestamp: Date
}

export type SortOrder = "newest" | "oldest"
