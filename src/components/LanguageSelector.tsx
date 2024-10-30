import React from "react"
import { Language, LanguageNameEn, LanguageNameJa } from "../types"
import { Map } from "./Map"

export type LanguageSelectorProps = {
  label: string
  value: string
  localStorageKey: string
  onChange: (value: Language) => void
}

export const languages: Language[] = ["ja", "en", "vi", "zh", "ko"]
export const languageNamesEn: Record<Language, LanguageNameEn> = {
  ja: "Japanese",
  en: "English",
  vi: "Vietnamese",
  zh: "Chinese",
  ko: "Korean",
}
export const languageNamesJa: Record<Language, LanguageNameJa> = {
  ja: "日本語",
  en: "英語",
  vi: "ベトナム語",
  zh: "中国語",
  ko: "韓国語",
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  value,
  localStorageKey,
  onChange,
}) => {
  return (
    <div className="mb-4 w-full">
      <label className="block font-semibold mb-2">{label}:</label>
      <select
        value={value}
        onChange={(e) => {
          const language = e.target.value as Language
          localStorage.setItem(localStorageKey, language)
          onChange(language)
        }}
        className="p-2 border rounded-md w-full"
      >
        <Map items={languages}>
          {(language) => (
            <option value={language}>{languageNamesEn[language]}</option>
          )}
        </Map>
      </select>
    </div>
  )
}
