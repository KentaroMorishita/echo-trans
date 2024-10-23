import React, { useState, useEffect } from "react"
import { FaSave, FaTrash } from "react-icons/fa"

interface ApiKeyManagerProps {
  apiKey: string
  setApiKey: (key: string) => void
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ setApiKey }) => {
  const [apiKey, setLocalApiKey] = useState("")
  const [apiKeyVisible, setApiKeyVisible] = useState(false)

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey")
    if (storedApiKey) {
      setLocalApiKey(storedApiKey)
      setApiKey(storedApiKey)
      setApiKeyVisible(false)
    } else {
      setApiKeyVisible(true)
    }
  }, [setApiKey])

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalApiKey(e.target.value)
  }

  const saveApiKey = () => {
    localStorage.setItem("apiKey", apiKey)
    setApiKey(apiKey)
    setApiKeyVisible(false)
  }

  const clearApiKey = () => {
    localStorage.removeItem("apiKey")
    setLocalApiKey("")
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

export default ApiKeyManager
