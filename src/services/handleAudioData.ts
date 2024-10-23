import { setFromTextType } from "./types"

export const handleAudioData = async (
  data: Blob,
  apiKey: string,
  setFromText: setFromTextType
): Promise<string | undefined> => {
  const formData = new FormData()
  formData.append("file", data, "audio.wav")
  formData.append("model", "whisper-1")

  try {
    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error("Error:", error)
      alert(`Error: ${error.error.message}`)
      return
    }

    const result = await response.json()
    setFromText(result.text)
    return result.text
  } catch (error: unknown) {
    error instanceof Error && alert("Audio processing error: " + error.message)
    throw error
  }
}
