import { RBox } from "f-box-core"
import { TranslationHistory } from "../types"

// import importData from "../translations.json"

// const data: TranslationHistory[] = importData.map((history) => ({
//   ...history,
//   timestamp: new Date(history.timestamp),
// }))

export const translationsBox = RBox.pack<TranslationHistory[]>([])
