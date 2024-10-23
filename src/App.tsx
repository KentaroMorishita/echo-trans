import React, { useState } from "react"
import { FaEye, FaEyeSlash, FaMicrophone, FaLanguage } from "react-icons/fa"
import AudioRecorder from "./components/AudioRecorder"
import LanguageSelector from "./components/LanguageSelector"
import ApiKeyManager from "./components/ApiKeyManager"
import { checkApiKey } from "./services/checkApiKey"
import { handleAudioData } from "./services/handleAudioData"
import { handleTranslation } from "./services/handleTranslation"
import { TranslationHistory } from "./services/types"

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState("")
  const [fromLang, setFromLang] = useState("ja")
  const [toLang, setToLang] = useState("en")
  const [translations, setTranslations] = useState<TranslationHistory[]>([])
  const [isPanelVisible, setIsPanelVisible] = useState(true)

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <h1 className="text-2xl font-bold mb-4">
        Whisper & ChatGPT Translation System
      </h1>

      <button
        onClick={() => setIsPanelVisible(!isPanelVisible)}
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

      {isPanelVisible && (
        <div className="mb-4">
          <ApiKeyManager setApiKey={setApiKey} />
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <LanguageSelector
              label="From"
              value={fromLang}
              onChange={setFromLang}
            />
            <LanguageSelector label="To" value={toLang} onChange={setToLang} />
            {/* prettier-ignore */}
            <AudioRecorder
              onAudioData={(data: Blob) =>
                Promise.resolve(data)
                  .then((data) => checkApiKey(apiKey, data))
                  .then((data) => handleAudioData(data, apiKey, (text) => text))
                  .then((text) => handleTranslation(text, apiKey, fromLang, toLang))
                  .then((history) => setTranslations((prev) => [history, ...prev]))
                  .catch((error) => console.error(error))
              }
            />
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">Translation History</h2>
        {translations.length > 0 ? (
          translations.map((item, index) => (
            <div
              key={index}
              className={`mb-4 p-3 bg-gray-100 rounded-lg shadow-sm`}
            >
              <div className="flex items-center mb-2 text-lg text-gray-600">
                <FaMicrophone className="mr-2" />
                <span>{item.original}</span>
              </div>
              <div className="flex items-center text-2xl text-blue-600">
                <FaLanguage className="mr-2" />
                <span>{item.translated}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No translations yet.</p>
        )}
      </div>
    </div>
  )
}

export default App
