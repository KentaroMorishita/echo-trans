import { VADSettings } from "../types"

export const loadVADSettings = (): VADSettings => {
  const saved = localStorage.getItem("vadSettings")
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.warn("Failed to parse saved VAD settings, using defaults")
    }
  }
  
  // デフォルト値
  return {
    speakingThreshold: 25,
    silenceThreshold: 15,
    silenceDuration: 1500,
  }
}

export const saveVADSettings = (settings: VADSettings): void => {
  localStorage.setItem("vadSettings", JSON.stringify(settings))
}