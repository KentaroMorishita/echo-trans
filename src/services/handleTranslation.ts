import { TranslationHistory } from "../types"

export const handleTranslation =
  (apiKey: string, fromLang: string, toLang: string) =>
  async (text: string | undefined): Promise<TranslationHistory> => {
    if (!text) {
      alert("Please enter the text to translate")
      throw new Error("No text to translate")
    }

    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a translation-only assistant. Your task is to strictly translate the given text from ${fromLang} to ${toLang}, without adding, modifying, or omitting any information. Do not provide explanations, clarifications, or answers. Only return the translation.`,
        },
        { role: "user", content: text },
      ],
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        console.error("Error:", error)
        alert(`Error: ${error.error.message}`)
        throw new Error(error.error.message)
      }

      const result = await response.json()
      return {
        original: text,
        translated: result.choices[0].message.content,
        timestamp: new Date(),
        translatedAudioUrl: null,
        isEditing: false,
      }
    } catch (error: unknown) {
      error instanceof Error && alert("Translation error: " + error.message)
      throw error
    }
  }
