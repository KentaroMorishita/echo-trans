import { TaskEither } from "fp-ts/lib/TaskEither"
import { tryCatch } from "fp-ts/lib/TaskEither"
import { TranslationHistory } from "../types"
import { handleError } from "./handleError"
import { languageNamesEn } from "../components/LanguageSelector"

import { configBox } from "../box/config"

export const handleTranslation: (
  text: string
) => TaskEither<Error, TranslationHistory> = (text) =>
  tryCatch(async () => {
    const { apiKey, fromLang, toLang } = configBox.getValue()
    if (!text) {
      alert("Please enter the text to translate")
      throw "No text to translate"
    }

    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a translation-only assistant. Your task is to strictly translate the given text from ${languageNamesEn[fromLang]} to ${languageNamesEn[toLang]}, without adding, modifying, or omitting any information. Do not provide explanations, clarifications, or answers. Only return the translation.`,
        },
        { role: "user", content: text },
      ],
    }
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      throw error.error.message
    }

    const result = await response.json()
    return Promise.resolve<TranslationHistory>({
      original: text,
      translated: result.choices[0].message.content,
      timestamp: new Date(),
      translatedAudioUrl: null,
      isEditing: false,
    })
  }, handleError)
