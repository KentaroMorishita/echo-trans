import { RBox } from "f-box-core"
import { Config, Language } from "../types"
import { loadVADSettings } from "../utils/vadSettingsLoader"

const loadEnableVAD = (): boolean => {
  const saved = localStorage.getItem("enableVAD")
  return saved ? saved === "true" : true
}

const loadFromLang = (): Language => {
  const saved = localStorage.getItem("fromLang")
  return (saved as Language) || "ja"
}

const loadToLang = (): Language => {
  const saved = localStorage.getItem("toLang")
  return (saved as Language) || "en"
}

const loadRecordingMode = (): "manual" | "auto" => {
  const saved = localStorage.getItem("recordingMode")
  return (saved as "manual" | "auto") || "manual"
}

const loadSpeechModel = (): "whisper-1" | "gpt-4o-mini-transcribe" => {
  const saved = localStorage.getItem("speechModel")
  return (saved as "whisper-1" | "gpt-4o-mini-transcribe") || "gpt-4o-mini-transcribe"
}

export const configBox = RBox.pack<Config>({
  apiKey: "",
  apiKeyVisible: true,
  fromLang: loadFromLang(),
  toLang: loadToLang(),
  selectedDeviceId: "",
  enableVAD: loadEnableVAD(),
  speechModel: loadSpeechModel(),
  vadSettings: loadVADSettings(),
  recordingMode: loadRecordingMode(),
})

