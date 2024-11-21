import { RBox } from "../lib/rbox"
import { Config } from "../types"

export const configBox = RBox.pack<Config>({
  apiKey: "",
  apiKeyVisible: true,
  fromLang: "ja",
  toLang: "en",
  selectedDeviceId: "",
  enableVAD: true,
})

