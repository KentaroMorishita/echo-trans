import { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { tryCatch } from "fp-ts/lib/TaskEither"
import { Config } from "../types"
import { handleError } from "./handleError"

export const handleTextToSpeech: (
  text: string
) => ReaderTaskEither<Config, Error, string> =
  (text: string) =>
  ({ apiKey }) =>
    tryCatch(async () => {
      if (!text) {
        alert("Please enter the text to speech")
        throw "No text to speech"
      }

      const requestBody = {
        model: "tts-1",
        input: text,
        voice: "alloy",
      }

      const response = await fetch("https://api.openai.com/v1/audio/speech", {
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

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()

      return Promise.resolve(audioUrl)
    }, handleError)
