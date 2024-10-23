import React, { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import AudioRecorder from "./components/AudioRecorder"
import TranslationPane from "./components/TranslationPane"
import LanguageSelector from "./components/LanguageSelector"
import ApiKeyManager from "./components/ApiKeyManager"
import { checkApiKey } from "./services/checkApiKey"
import { handleAudioData } from "./services/handleAudioData"
import { handleTranslation } from "./services/handleTranslation"

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState("")
  const [fromText, setFromText] = useState("")
  const [toText, setToText] = useState("")
  const [fromLang, setFromLang] = useState("ja")
  const [toLang, setToLang] = useState("vi")
  const [isPanelVisible, setIsPanelVisible] = useState(true)

  const togglePanelVisibility = () => {
    setIsPanelVisible(!isPanelVisible)
  }

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <h1 className="text-2xl font-bold mb-4">
        Whisper & ChatGPT Translation System
      </h1>

      {/* スタイリッシュなトグルボタン */}
      <button
        onClick={togglePanelVisibility}
        className={`mb-4 px-4 py-2 flex items-center justify-center rounded-full transition-all duration-300 ${
          isPanelVisible
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-600 hover:bg-gray-700"
        } shadow-lg text-white`}
      >
        {isPanelVisible ? (
          <FaEyeSlash className="mr-2 text-lg" />
        ) : (
          <FaEye className="mr-2 text-lg" />
        )}
        <span className="font-medium">
          {isPanelVisible ? "Hide Controls" : "Show Controls"}
        </span>
      </button>

      {/* 操作パネル */}
      {isPanelVisible && (
        <div className="mb-4">
          <ApiKeyManager setApiKey={setApiKey} />
          <div className="flex space-x-4 mb-4 items-center">
            <LanguageSelector
              label="From"
              value={fromLang}
              onChange={setFromLang}
            />
            <LanguageSelector label="To" value={toLang} onChange={setToLang} />
            {/* prettier-ignore */}
            <AudioRecorder
              onAudioData={(data: Blob) => Promise.resolve(data)
                .then((data) => checkApiKey(apiKey, data))
                .then((data) => handleAudioData(data, apiKey, setFromText))
                .then((text) => handleTranslation(text, apiKey, fromLang, toLang, setToText))
                .catch((error) => console.error(error))
              }
            />
          </div>
        </div>
      )}

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
