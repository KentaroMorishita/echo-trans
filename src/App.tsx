import React, { useState, useEffect } from "react"
import {
  FaCog,
  FaMicrophone,
  FaLanguage,
  FaSortUp,
  FaSortDown,
  FaHistory,
} from "react-icons/fa"
import AudioRecorder from "./components/AudioRecorder"
import SettingsModal from "./components/SettingsModal"
import { checkApiKey } from "./services/checkApiKey"
import { handleAudioData } from "./services/handleAudioData"
import { handleTranslation } from "./services/handleTranslation"
import { TranslationHistory } from "./services/types"

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState("")
  const [fromLang, setFromLang] = useState("ja")
  const [toLang, setToLang] = useState("en")
  const [translations, setTranslations] = useState<TranslationHistory[]>([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest") // 並べ替え順序の状態

  // APIキーを初期化
  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey")
    if (storedApiKey) {
      setApiKey(storedApiKey)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      {/* タイトルと設定ボタン */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">
          Whisper & ChatGPT Translation System
        </h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="text-gray-700 hover:text-gray-900"
          aria-label="Open Settings"
        >
          <FaCog size={24} />
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        fromLang={fromLang}
        toLang={toLang}
        setFromLang={setFromLang}
        setToLang={setToLang}
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
      />

      {/* Audio Recorder */}
      <div className="mb-4">
        <AudioRecorder
          selectedDeviceId={selectedDeviceId}
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

      {/* Translation History */}
      <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
        {/* ヘッダー: タイトルとソートアイコン */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <FaHistory className="mr-2 text-xl text-gray-700" />
            <h2 className="text-xl font-bold">Translation History</h2>
          </div>
          {/* ソートボタン */}
          <button
            onClick={() =>
              setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
            }
            className="text-gray-700 hover:text-gray-900 focus:outline-none"
            aria-label={`Sort ${
              sortOrder === "newest" ? "Oldest First" : "Newest First"
            }`}
          >
            {sortOrder === "newest" ? (
              <FaSortUp className="text-xl" />
            ) : (
              <FaSortDown className="text-xl" />
            )}
          </button>
        </div>
        {translations.length > 0 ? (
          (() => {
            const sortedTranslations = [...translations]
            if (sortOrder === "newest") {
              sortedTranslations.reverse()
            }
            return sortedTranslations.map((item, index) => (
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
          })()
        ) : (
          <p className="text-sm text-gray-500">No translations yet.</p>
        )}
      </div>
    </div>
  )
}

export default App
