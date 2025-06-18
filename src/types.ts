export type Language = "ja" | "en" | "vi" | "zh" | "ko"
export type LanguageNameEn =
  | "Japanese"
  | "English"
  | "Vietnamese"
  | "Chinese"
  | "Korean"
export type LanguageNameJa =
  | "日本語"
  | "英語"
  | "ベトナム語"
  | "中国語"
  | "韓国語"

export type SpeechModel = "whisper-1" | "gpt-4o-mini-transcribe"

export type RecordingMode = "manual" | "auto"

export type VADSettings = {
  speakingThreshold: number
  silenceThreshold: number
  silenceDuration: number
}

export type Config = {
  apiKey: string
  apiKeyVisible: boolean
  fromLang: Language
  toLang: Language
  selectedDeviceId: string
  enableVAD: boolean
  speechModel: SpeechModel
  vadSettings: VADSettings
  recordingMode: RecordingMode
}

export type TranslationHistory = {
  original: string
  translated: string
  timestamp: Date
  translatedAudioUrl: string | null
  isEditing?: boolean
}

export type SortOrder = "newest" | "oldest"
