import React, { useState, useEffect } from "react"
import {
  FaCog,
  FaSortUp,
  FaSortDown,
  FaHistory,
  FaDownload,
} from "react-icons/fa"
import { SettingsModal } from "./components/SettingsModal"
import { AudioRecorder } from "./components/AudioRecorder"
import { TranslationList } from "./components/TranslationList"
import { Match, When } from "./components/Match"
import { downloadTranslations } from "./services/downloadTranslations"
import { checkApiKey } from "./services/checkApiKey"
import { handleAudioData } from "./services/handleAudioData"
import { handleTranslation } from "./services/handleTranslation"
import { TranslationHistory, SortOrder } from "./types"
import { match, when } from "./services/match"

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState("")
  const [fromLang, setFromLang] = useState("ja")
  const [toLang, setToLang] = useState("en")
  const [translations, setTranslations] = useState<TranslationHistory[]>([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey")
    when([!!storedApiKey, () => setApiKey(storedApiKey!)])
  }, [])

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-wider font-sans drop-shadow-lg">
          EchoTrans
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
              .then((history) => setTranslations((prev) => [...prev, history]))
              .catch((error) => console.error(error))
          }
        />
      </div>

      {/* Translation History */}
      <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <FaHistory className="mr-2 text-xl text-gray-700" />
            <h2 className="text-xl font-bold">Translation History</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => downloadTranslations(translations, sortOrder)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
              aria-label="Download Translation History"
            >
              <FaDownload className="text-xl" />
            </button>
            <button
              onClick={() =>
                setSortOrder((prev) =>
                  match<SortOrder>([
                    [prev === "oldest", () => "newest"],
                    [prev === "newest", () => "oldest"],
                  ])(() => prev)
                )
              }
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <Match>
                <When exp={sortOrder === "newest"}>
                  <FaSortUp className="text-xl" />
                </When>
                <When exp={sortOrder === "oldest"}>
                  <FaSortDown className="text-xl" />
                </When>
              </Match>
            </button>
          </div>
        </div>
        <TranslationList translations={translations} sortOrder={sortOrder} />
      </div>
    </div>
  )
}

export default App
