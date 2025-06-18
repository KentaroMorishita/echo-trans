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


export type VADSettings = {
  startThreshold: number      // 発話開始しきい値 (dB: -60 to 0)
  stopThreshold: number       // 発話停止しきい値 (dB: -60 to 0)
  minSpeechDuration: number   // 最小発話時間 (ms)
  minSilenceDuration: number  // 最小沈黙時間 (ms)
  smoothingFactor: number     // 平滑化係数 (0-1)
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
}

export type TranslationHistory = {
  original: string
  translated: string
  timestamp: Date
  translatedAudioUrl: string | null
  isEditing?: boolean
}

export type SortOrder = "newest" | "oldest"
