export type Language = "ja" | "en" | "vn"

export type Config = {
  apiKey: string
  fromLang: Language
  toLang: Language
  selectedDeviceId: string
}

export type TranslationHistory = {
  original: string
  translated: string
  timestamp: Date
  translatedAudioUrl: string | null
  isEditing?: boolean
}

export type SortOrder = "newest" | "oldest"
