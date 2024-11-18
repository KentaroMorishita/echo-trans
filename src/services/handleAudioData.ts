import { TaskEither } from "fp-ts/lib/TaskEither"
import { tryCatch } from "fp-ts/lib/TaskEither"
import { handleError } from "./handleError"

import { configBox } from "../box/config"

export const handleAudioData: (data: Blob) => TaskEither<Error, string> = (
  data
) =>
  tryCatch(async () => {
    const { apiKey } = configBox.getValue()

    const body = new FormData()
    body.append("file", data, "audio.wav")
    body.append("model", "whisper-1")

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw error.error.message
    }

    const result = await response.json()
    return Promise.resolve(result.text)
  }, handleError)
