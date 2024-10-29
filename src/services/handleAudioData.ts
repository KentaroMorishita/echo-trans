import { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { tryCatch } from "fp-ts/lib/TaskEither"
import { Config } from "../types"
import { handleError } from "./handleError"

export const handleAudioData: (
  data: Blob
) => ReaderTaskEither<Config, Error, string> =
  (data) =>
  ({ apiKey }) =>
    tryCatch(async () => {
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
