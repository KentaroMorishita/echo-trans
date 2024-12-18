import React from "react"

import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"

import { Language, LanguageNameEn, LanguageNameJa } from "../types"
import { Map } from "./Map"

type KeyType = "fromLang" | "toLang"

export type LanguageSelectorProps = {
  label: string
  localKey: KeyType
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
  localKey,
}) => {
  const [config] = useRBox(configBox)
  const setConfig = set(configBox)

  const setLanguage = (localKey: KeyType, language: Language) =>
    setConfig({ ...config, [localKey]: language })

  return (
    <div className="mb-4 w-full">
      <label className="block font-semibold mb-2">{label}:</label>
      <select
        value={config[localKey]}
        onChange={(e) => {
          const language = e.target.value as Language
          console.log(localKey, language)
          localStorage.setItem(localKey, language)
          setLanguage(localKey, language)
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
