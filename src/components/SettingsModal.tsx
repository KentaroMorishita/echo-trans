import React from "react"
import { FaTimes } from "react-icons/fa"
import { TabPanel, Tab } from "./TabPanel"
import { BasicSettingsTab } from "./settings/BasicSettingsTab"
import { AudioSettingsTab } from "./settings/AudioSettingsTab"
import { AdvancedSettingsTab } from "./settings/AdvancedSettingsTab"
import { When } from "./Match"

export type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const tabs: Tab[] = [
    {
      id: "basic",
      label: "Basic",
      content: <BasicSettingsTab />,
    },
    {
      id: "audio",
      label: "Audio",
      content: <AudioSettingsTab />,
    },
    {
      id: "advanced",
      label: "Advanced",
      content: <AdvancedSettingsTab />,
    },
  ]

  return (
    <When exp={isOpen}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            aria-label="Close Settings"
          >
            <FaTimes size={20} />
          </button>
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <TabPanel tabs={tabs} defaultTab="basic" />
        </div>
      </div>
    </When>
  )
}
