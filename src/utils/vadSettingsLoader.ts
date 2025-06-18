import { VADSettings } from "../types"

export const loadVADSettings = (): VADSettings => {
  const saved = localStorage.getItem("vadSettings")
  console.log("Loading VAD settings from localStorage:", saved)

  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      console.log("Parsed VAD settings:", parsed)
      
      // 新形式かチェック
      if (parsed.startThreshold !== undefined && parsed.stopThreshold !== undefined) {
        return parsed
      }
      
      // 旧形式から新形式に変換
      if (parsed.speakingThreshold !== undefined) {
        console.log("Converting old VAD settings format to new format")
        return {
          startThreshold: -16,
          stopThreshold: -20,
          minSpeechDuration: 200,
          minSilenceDuration: 200,
          smoothingFactor: 0.9,
        }
      }
    } catch {
      console.warn("Failed to parse saved VAD settings, using defaults")
    }
  }

  // デフォルト値（新形式）
  const defaults = {
    startThreshold: -16,        // -16 dB で発話開始
    stopThreshold: -20,         // -20 dB で発話停止  
    minSpeechDuration: 200,     // 最低200ms発話
    minSilenceDuration: 200,    // 最低200ms沈黙
    smoothingFactor: 0.9,       // 平滑化係数（90%）
  }
  console.log("Using default VAD settings:", defaults)
  return defaults
}

export const saveVADSettings = (settings: VADSettings): void => {
  console.log("Saving VAD settings to localStorage:", settings)
  localStorage.setItem("vadSettings", JSON.stringify(settings))
}