export const handleTextToSpeech =
  (apiKey: string) =>
  async (text: string | undefined): Promise<string | undefined> => {
    try {
      if (!text) {
        alert("Please enter the text to speech")
        throw new Error("No text to speech")
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
        console.error("Error:", error)
        alert(`Error: ${error.error.message}`)
        return
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      return audioUrl
    } catch (error: unknown) {
      error instanceof Error &&
        alert("Audio processing error: " + error.message)
      throw error
    }
  }
