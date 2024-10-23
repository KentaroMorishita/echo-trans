import React, { useState, useEffect } from "react"

interface ApiKeyManagerProps {
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
        className="px-4 py-2 font-semibold text-white rounded-lg shadow-md bg-blue-500 hover:bg-blue-600"
      >
        Save API Key
      </button>
    </div>
  ) : (
    <div className="mb-4 flex items-center space-x-4">
      <button
        onClick={clearApiKey}
        className="px-4 py-2 font-semibold text-white rounded-lg shadow-md bg-red-500 hover:bg-red-600"
      >
        Clear API Key
      </button>
    </div>
  )
}

export default ApiKeyManager
