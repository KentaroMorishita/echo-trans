import { Task, Either } from "f-box-core"
import { handleError } from "./handleError"

import { configBox } from "../box/config"

export const handleAudioData = (data: Either<Error, Blob>) =>
  Task.tryCatch<Either<Error, string>>(() => {
    if (Either.isLeft(data)) return data

    const { apiKey, speechModel } = configBox.getValue()
    const audioBlob = data.getValue()
    const body = new FormData()
    
    // MIMEタイプから適切なファイル拡張子を決定
    const mimeType = audioBlob.type
    let fileName = "audio.wav" // デフォルト
    if (mimeType.includes("webm")) {
      fileName = "audio.webm"
    } else if (mimeType.includes("mp3")) {
      fileName = "audio.mp3"
    } else if (mimeType.includes("mp4")) {
      fileName = "audio.mp4"
    }
    
    body.append("file", audioBlob, fileName)
    body.append("model", speechModel)

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
