import React, { useState } from "react"
import AudioRecorder from "./components/AudioRecorder"
import TranslationPane from "./components/TranslationPane"
import LanguageSelector from "./components/LanguageSelector"

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState("")
  const [fromText, setFromText] = useState("")
  const [toText, setToText] = useState("")
  const [fromLang, setFromLang] = useState("ja")
  const [toLang, setToLang] = useState("vi")

  // Whisper APIに音声データを送信する関数
  const handleAudioData = async (data: Blob) => {
    if (!apiKey) {
      alert("APIキーを入力してください")
      return
    }

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
        console.error("エラー:", error)
        alert(`エラー: ${error.error.message}`)
        return
      }

      const result = await response.json()
      setFromText(result.text)
      handleTranslation(result.text) // ChatGPTへの翻訳リクエスト
    } catch (error: unknown) {
      console.error("エラー:", error)
      error instanceof Error && alert("音声処理エラー: " + error.message)
    }
  }

  // ChatGPT APIに翻訳リクエストを送信する関数
  const handleTranslation = async (text: string) => {
    if (!apiKey) {
      alert("APIキーを入力してください")
      return
    }

    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `Translate from ${fromLang} to ${toLang}.` },
        { role: "user", content: text },
      ],
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        console.error("エラー:", error)
        alert(`エラー: ${error.error.message}`)
        return
      }

      const result = await response.json()
      setToText(result.choices[0].message.content) // 翻訳結果を表示
    } catch (error: unknown) {
      console.error("エラー:", error)
      error instanceof Error && alert("翻訳エラー: " + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <h1 className="text-2xl font-bold mb-4">
        Whisper & ChatGPT Translation System
      </h1>

      {/* APIキーの入力フォーム */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">APIキーを入力:</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="flex space-x-4 mb-4 items-center">
        <LanguageSelector
          label="From"
          value={fromLang}
          onChange={setFromLang}
        />
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
