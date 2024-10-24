import { TranslationHistory, SortOrder } from "../types"

export const downloadTranslations = (
  translations: TranslationHistory[],
  sortOrder: SortOrder
) => {
  if (translations.length === 0) {
    alert("No translations to download.")
    return
  }

  const sortedTranslations = [...translations]
  if (sortOrder === "newest") {
    sortedTranslations.reverse()
  }

  const dataStr = JSON.stringify(sortedTranslations, null, 2) // JSONを整形
  const blob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  const datetime = new Date()
    .toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(/(\/|:)/g, "")
  console.log(datetime)

  link.href = url
  link.download = `translations-${datetime}.json`
  link.click()
  URL.revokeObjectURL(url)
}
