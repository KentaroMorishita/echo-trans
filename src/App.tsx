import React, { useState } from "react"

import { useRBox } from "./hooks/useRBox"
import { configBox } from "./box/config"

import {
  FaCog,
  FaSortUp,
  FaSortDown,
  FaHistory,
  FaDownload,
} from "react-icons/fa"
import { pipe } from "fp-ts/lib/function"
import { right, flatMap, match as RTEMatch } from "fp-ts/lib/ReaderTaskEither"

import { SettingsModal } from "./components/SettingsModal"
import { AudioRecorder } from "./components/AudioRecorder"
import { TranslationList } from "./components/TranslationList"
import { Match, When } from "./components/Match"
import { downloadTranslations } from "./services/downloadTranslations"
import { checkApiKey } from "./services/checkApiKey"
import { handleAudioData } from "./services/handleAudioData"
import { handleTranslation } from "./services/handleTranslation"
import { arrayStateHandlers } from "./services/arrayStateHandlers"
import { Config, TranslationHistory, SortOrder } from "./types"
import { match } from "./services/match"

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
  const [isSettingsOpen, isSettingsOpenBox] = useRBox<boolean>(false)
  const [sortOrder, sortOrderBox] = useRBox<SortOrder>("newest")

  const [translations, setTranslations] = useState<TranslationHistory[]>([])

  const [config] = useRBox<Config>(configBox)
  const insertHistory = arrayStateHandlers(setTranslations)("insert")(Infinity)

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-wider font-sans drop-shadow-lg">
          EchoTrans
        </h1>
        <button
          onClick={() => isSettingsOpenBox.setValue(() => true)}
          className="text-gray-700 hover:text-gray-900"
          aria-label="Open Settings"
        >
          <FaCog size={24} />
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => isSettingsOpenBox.setValue(() => false)}
      />

      {/* Audio Recorder */}
      <div className="mb-4">
        <AudioRecorder
          config={config}
          onAudioData={(data: Blob) =>
            pipe(
              right(data),
              flatMap(checkApiKey),
              flatMap(handleAudioData),
              flatMap(handleTranslation),
              RTEMatch(
                (error) => console.error(error),
                (history) => insertHistory(history)
              )
            )(config)()
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
                sortOrderBox.setValue((prev) =>
                  match<SortOrder>([
                    [prev === "oldest", () => "newest"],
                    [prev === "newest", () => "oldest"],
                  ])(() => prev)
                )
              }
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <Match>
                <When exp={sortOrder === "oldest"}>
                  <FaSortUp className="text-xl" />
                </When>
                <When exp={sortOrder === "newest"}>
                  <FaSortDown className="text-xl" />
                </When>
              </Match>
            </button>
          </div>
        </div>
        <TranslationList
          config={config}
          translations={translations}
          sortOrder={sortOrder}
          setTranslations={setTranslations}
        />
      </div>
    </div>
  )
}

export default App
