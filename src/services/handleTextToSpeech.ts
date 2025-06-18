import { Task, Either } from "f-box-core"
import { handleError } from "./handleError"
import { configBox } from "../box/config"

export const handleTextToSpeech = (text: Either<Error, string>) =>
  Task.tryCatch<Either<Error, string>>(() => {
    if (Either.isLeft(text)) return text

    const { apiKey } = configBox.getValue()
    const requestBody = {
      model: "tts-1",
      input: text.getValue(),
      voice: "alloy",
    }

    return fetch("https://api.openai.com/v1/audio/speech", {
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

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()

      return Either.right(audioUrl)
    })
  }, handleError)
