import React, { useState, useEffect } from "react"
import AudioRecorder from "./components/AudioRecorder"
import TranslationPane from "./components/TranslationPane"
import LanguageSelector from "./components/LanguageSelector"
import useWebSocket from "./hooks/useWebSocket"

const App = () => {
  const [fromText, setFromText] = useState("")
  const [toText, setToText] = useState("")
  const [fromLang, setFromLang] = useState("ja")
  const [toLang, setToLang] = useState("vi")

  const { messages, sendMessage } = useWebSocket("ws://localhost:3030")

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      setToText(latestMessage)
    }
  }, [messages])

  const handleAudioData = async (data: Blob) => {
    try {
      const formData = new FormData()
      formData.append("audio", data)

      const response = await fetch("http://localhost:3030/whisper", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      setFromText(result.fromText)

      handleTranslate(result.fromText)
    } catch (error) {
      console.error("Whisper APIエラー:", error)
    }
  }

  const handleTranslate = async (text: string) => {
    try {
      const requestPayload = JSON.stringify({
        text,
        fromLang: fromLang,
        toLang: toLang,
      })

      sendMessage(requestPayload)

      const response = await fetch("http://localhost:3030/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestPayload,
      })

      const result = await response.json()
      setToText(result.translatedText)
    } catch (error) {
      console.error("Translate APIエラー:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <h1 className="text-2xl font-bold mb-4">PAX Translation System</h1>

      <div className="flex space-x-4 mb-4 items-start">
        {/* prettier-ignore */}
        <LanguageSelector label="From" value={fromLang} onChange={setFromLang} />
        <LanguageSelector label="To" value={toLang} onChange={setToLang} />
        <AudioRecorder onAudioData={handleAudioData} />
      </div>

      <TranslationPane
        from={fromText}
        to={toText}
        fromLabel="From"
        toLabel="To"
      />
    </div>
  )
}

export default App
