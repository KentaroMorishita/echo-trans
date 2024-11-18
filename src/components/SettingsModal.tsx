import React from "react"
import { FaTimes } from "react-icons/fa"
import { ApiKeyManager } from "./ApiKeyManager"
import { LanguageSelector } from "./LanguageSelector"
import { VADSelector } from "./VADSelector"
import { AudioDeviceSelector } from "./AudioDeviceSelector"
import { When } from "./Match"

export type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
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
            <ApiKeyManager />
            <div className="flex gap-2">
              <LanguageSelector label="From Language" localKey="fromLang" />
              <LanguageSelector label="To Language" localKey="toLang" />
            </div>
            <VADSelector />
            <AudioDeviceSelector />
          </div>
        </div>
      </div>
    </When>
  )
}
