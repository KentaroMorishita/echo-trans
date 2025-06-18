import React from "react"
import { ApiKeyManager } from "../ApiKeyManager"
import { LanguageSelector } from "../LanguageSelector"
import { SpeechModelSelector } from "../SpeechModelSelector"

export const BasicSettingsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <ApiKeyManager />
      <SpeechModelSelector />
      <div className="flex gap-2">
        <LanguageSelector label="From Language" localKey="fromLang" />
        <LanguageSelector label="To Language" localKey="toLang" />
      </div>
    </div>
  )
}