import React, { useState } from "react"
import AudioRecorder from "./components/AudioRecorder"
import TranslationPane from "./components/TranslationPane"
import LanguageSelector from "./components/LanguageSelector"
import useWebSocket from "./hooks/useWebSocket"

const App = () => {
  const [fromText, setFromText] = useState("")
  const [toText, setToText] = useState("")
  const [fromLang, setFromLang] = useState("ja")
  const [toLang, setToLang] = useState("vi")

  const messages = useWebSocket("ws://localhost:8080")

  const handleAudioData = async (data: Blob) => {
    try {
      const formData = new FormData()
      formData.append("audio", data)
      formData.append("from", fromLang)
      formData.append("to", toLang)

      const response = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      setFromText(result.fromText)
    } catch (error) {
      console.error("音声処理エラー:", error)
    }
  }

  if (messages.length > 0) {
    setToText(messages[messages.length - 1])
  }

  return (
    <div className="min-h-scree bg-gray-200 p-4">
      <h1 className="text-2xl font-bold mb-4">PAX Translation System</h1>

      <div className="flex space-x-4 mb-4 items-center">
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
