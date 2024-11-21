import React from "react"
import { FaSave, FaTrash } from "react-icons/fa"

import { useRBox, set } from "../hooks/useRBox"
import { configBox } from "../box/config"

export const ApiKeyManager: React.FC = () => {
  const [config] = useRBox(configBox)
  const setConfig = set(configBox)

  const { apiKey, apiKeyVisible } = config

  const setApiKey = (value: string) => setConfig({ ...config, apiKey: value })
  const setApiKeyVisible = (value: boolean) =>
    setConfig({ ...config, apiKeyVisible: value })

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setApiKey(e.target.value)

  const saveApiKey = () => {
    localStorage.setItem("apiKey", apiKey)
    localStorage.setItem("apiKeyVisible", "false")
    setApiKey(apiKey)
    setApiKeyVisible(false)
  }

  const clearApiKey = () => {
    localStorage.removeItem("apiKey")
    localStorage.setItem("apiKeyVisible", "true")
    setApiKey("")
    setApiKeyVisible(true)
  }

  return apiKeyVisible ? (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Enter API Key:</label>
      <input
        type="text"
        value={apiKey}
        onChange={handleApiKeyChange}
        className="w-full mb-2 p-2 border rounded-md"
      />
      <button
        onClick={saveApiKey}
        className="flex items-center justify-center px-4 py-2 mt-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-lg"
      >
        <FaSave className="mr-2 text-lg" />
        <span className="font-medium">Save API Key</span>
      </button>
    </div>
  ) : (
    <div className="mb-4 flex items-center space-x-4">
      <button
        onClick={clearApiKey}
        className="flex items-center justify-center px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-lg"
      >
        <FaTrash className="mr-2 text-lg" />
        <span className="font-medium">Clear API Key</span>
      </button>
    </div>
  )
}
