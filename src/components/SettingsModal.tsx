import React from "react"
import { FaTimes } from "react-icons/fa"
import { ApiKeyManager } from "./ApiKeyManager"
import { LanguageSelector } from "./LanguageSelector"
import { AudioDeviceSelector } from "./AudioDeviceSelector"
import { When } from "./Match"
import { Language } from "../types"

export type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  apiKey: string
  setApiKey: (key: string) => void
  fromLang: Language
  toLang: Language
  setFromLang: (lang: Language) => void
  setToLang: (lang: Language) => void
  selectedDeviceId: string
  setSelectedDeviceId: (deviceId: string) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  fromLang,
  toLang,
  setFromLang,
  setToLang,
  selectedDeviceId,
  setSelectedDeviceId,
}) => {
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
            <ApiKeyManager apiKey={apiKey} setApiKey={setApiKey} />
            <LanguageSelector
              label="From"
              value={fromLang}
              onChange={setFromLang}
            />
            <LanguageSelector label="To" value={toLang} onChange={setToLang} />
            <AudioDeviceSelector
              selectedDeviceId={selectedDeviceId}
              setSelectedDeviceId={setSelectedDeviceId}
            />
          </div>
        </div>
      </div>
    </When>
  )
}
