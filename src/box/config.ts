import { RBox } from "f-box-core"
import { Config } from "../types"

export const configBox = RBox.pack<Config>({
  apiKey: "",
  apiKeyVisible: true,
  fromLang: "ja",
  toLang: "en",
  selectedDeviceId: "",
  enableVAD: true,
  speechModel: "gpt-4o-mini-transcribe",
})

