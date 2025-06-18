import React from "react"

import { useRBox, set } from "f-box-react"
import { configBox } from "./box/config"
import { translationsBox } from "./box/translations"

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
import { arrayRBoxHandlers } from "./services/arrayRBoxHandlers"
import { Config, TranslationHistory, SortOrder } from "./types"
import { match } from "./services/match"

import { Task } from "f-box-core"

const storedConfig = (key: keyof Config) => {
  const local = localStorage.getItem(key)
  const value = configBox.getValue()[key]
  return typeof value === "boolean"
    ? local === null
      ? value
      : local === "true"
    : local || value
}

;(Object.keys(configBox.getValue()) as Array<keyof Config>).map((key) => {
  configBox.setValue((value) => ({ ...value, [key]: storedConfig(key) }))
})

const App: React.FC = () => {
  const [translations] = useRBox<TranslationHistory[]>(translationsBox)
  const insertHistory = arrayRBoxHandlers(translationsBox)("insert")(Infinity)

  const [isSettingsOpen, isSettingsOpenBox] = useRBox<boolean>(false)
  const [sortOrder, sortOrderBox] = useRBox<SortOrder>("newest")

  const setIsSettingsOpen = set(isSettingsOpenBox)
  const setSortOrder = set(sortOrderBox)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EchoTrans
              </h1>
              <span className="text-sm text-gray-500 font-medium">Voice Translation</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              aria-label="Open Settings"
            >
              <FaCog size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Audio Recorder Section - コンパクト */}
        <section>
          <AudioRecorder
            onAudioData={(data: Blob) =>
              Task.pack(data)
                [">>="](checkApiKey)
                [">>="](handleAudioData)
                [">>="](handleTranslation)
                ["<$>"]((result) =>
                  result.match(
                    (error: Error) => {
                      alert(error.message)
                      console.error(error.message)
                    },
                    (history: TranslationHistory) => insertHistory(history)
                  )
                )
                .run()
            }
          />
        </section>

        {/* Translation History Section - メインフォーカス */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 min-h-[70vh]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <FaHistory className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Translations
                </h2>
                <p className="text-sm text-gray-500">Your voice translation history</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => downloadTranslations(translations, sortOrder)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                aria-label="Download Translation History"
                title="Download History"
              >
                <FaDownload className="text-sm" />
                <span className="text-sm font-medium">Export</span>
              </button>
              <button
                onClick={() =>
                  setSortOrder(
                    match<SortOrder>([
                      [sortOrder === "oldest", () => "newest"],
                      [sortOrder === "newest", () => "oldest"],
                    ])(() => sortOrder)
                  )
                }
                className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                title={`Sort by ${sortOrder === "newest" ? "Oldest" : "Newest"} first`}
              >
                <Match>
                  <When exp={sortOrder === "oldest"}>
                    <FaSortUp className="text-lg" />
                  </When>
                  <When exp={sortOrder === "newest"}>
                    <FaSortDown className="text-lg" />
                  </When>
                </Match>
              </button>
            </div>
          </div>
          <TranslationList sortOrder={sortOrder} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600">
            Powered by OpenAI Whisper & GPT-4o-mini • Built with React & TypeScript
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
