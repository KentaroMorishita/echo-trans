import { Task, Either } from "f-box-core"
import { TranslationHistory } from "../types"
import { handleError } from "./handleError"
import { languageNamesEn } from "../components/LanguageSelector"

import { configBox } from "../box/config"

export const handleTranslation = (text: Either<Error, string>) =>
  Task.tryCatch<Either<Error, TranslationHistory>>(() => {
    if (Either.isLeft(text)) return text

    const { apiKey, fromLang, toLang } = configBox.getValue()
    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a translation-only assistant. Your task is to strictly translate the given text from ${languageNamesEn[fromLang]} to ${languageNamesEn[toLang]}, without adding, modifying, or omitting any information. Do not provide explanations, clarifications, or answers. Only return the translation.`,
        },
        { role: "user", content: text.getValue() },
      ],
    }

    return fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json()
        throw error.error.message
      }

      const result = await response.json()
      return Either.right({
        original: text.getValue(),
        translated: result.choices[0].message.content,
        timestamp: new Date(),
        translatedAudioUrl: null,
        isEditing: false,
      } as TranslationHistory)
    })
  }, handleError)
