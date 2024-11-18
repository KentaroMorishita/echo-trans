import { rbox } from "../lib/rbox"
import { Config } from "../types"

export const configBox = rbox<Config>({
  apiKey: "",
  apiKeyVisible: true,
  fromLang: "ja",
  toLang: "en",
  selectedDeviceId: "",
  enableVAD: true,
})

