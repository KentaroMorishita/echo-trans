import { Task, Either } from "f-box-core"
import { handleError } from "./handleError"

import { configBox } from "../box/config"

export const handleAudioData = (data: Either<Error, Blob>) =>
  Task.tryCatch<Either<Error, string>>(() => {
    if (Either.isLeft(data)) return data

    const { apiKey } = configBox.getValue()
    const body = new FormData()
    body.append("file", data.getValue(), "audio.wav")
    body.append("model", "whisper-1")

    return fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json()
        throw error.error.message
      }

      const result = await response.json()
      return Either.right(result.text)
    })
  }, handleError)
