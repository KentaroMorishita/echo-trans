import React, { useEffect, useState } from "react"
import { FaTimes } from "react-icons/fa"
import { Tab } from "./TabPanel"
import { BasicSettingsTab } from "./settings/BasicSettingsTab"
import { AudioSettingsTab } from "./settings/AudioSettingsTab"
import { VADSettingsTab } from "./settings/VADSettingsTab"
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
      id: "vad",
      label: "VAD",
      content: <VADSettingsTab />,
    },
  ]

  const [activeTab, setActiveTab] = useState("basic")

  // 外側クリックでモーダルを閉じる
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Escキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // モーダルが開いている間はページのスクロールを無効化
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <When exp={isOpen}>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-lg w-full max-w-2xl h-[85vh] min-h-[500px] max-h-[800px] flex flex-col relative">
          {/* 固定ヘッダー */}
          <div className="flex-shrink-0 p-6 pb-0 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Settings</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close Settings"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            {/* タブナビゲーション - 固定 */}
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* スクロール可能なコンテンツ */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {tabs.find((tab) => tab.id === activeTab)?.content}
            </div>
          </div>
        </div>
      </div>
    </When>
  )
}
