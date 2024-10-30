import React from "react"
import { FaTimes } from "react-icons/fa"
import { ApiKeyManager } from "./ApiKeyManager"
import { LanguageSelector } from "./LanguageSelector"
import { AudioDeviceSelector } from "./AudioDeviceSelector"
import { When } from "./Match"
import { Config } from "../types"
import { objectStateUpdater } from "../services/objectStateUpdater"

export type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  config: Config
  setConfig: (value: React.SetStateAction<Config>) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config: { apiKey, fromLang, toLang, selectedDeviceId },
  setConfig,
}) => {
  const configSetter = objectStateUpdater(setConfig)

  return (
    <When exp={isOpen}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg w-11/12 max-w-lg p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Close Settings"
          >
            <FaTimes size={20} />
          </button>
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <div className="space-y-4">
            <ApiKeyManager apiKey={apiKey} setApiKey={configSetter("apiKey")} />
            <div className="flex gap-2">
              <LanguageSelector
                label="From Language"
                value={fromLang}
                localStorageKey="fromLang"
                onChange={configSetter("fromLang")}
              />
              <LanguageSelector
                label="To Language"
                value={toLang}
                localStorageKey="toLang"
                onChange={configSetter("toLang")}
              />
            </div>
            <AudioDeviceSelector
              selectedDeviceId={selectedDeviceId}
              setSelectedDeviceId={configSetter("selectedDeviceId")}
            />
          </div>
        </div>
      </div>
    </When>
  )
}
