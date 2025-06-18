import { VADSettings } from "../types"

export const loadVADSettings = (): VADSettings => {
  const saved = localStorage.getItem("vadSettings")
  console.log("Loading VAD settings from localStorage:", saved)

  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      console.log("Parsed VAD settings:", parsed)
      return parsed
    } catch (e) {
      console.warn("Failed to parse saved VAD settings, using defaults")
    }
  }

  // デフォルト値
  const defaults = {
    speakingThreshold: 25,
    silenceThreshold: 15,
    silenceDuration: 10,
  }
  console.log("Using default VAD settings:", defaults)
  return defaults
}

export const saveVADSettings = (settings: VADSettings): void => {
  console.log("Saving VAD settings to localStorage:", settings)
  localStorage.setItem("vadSettings", JSON.stringify(settings))
}