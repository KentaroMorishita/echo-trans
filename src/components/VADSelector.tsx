import React, { useState } from "react"
import { FaCog } from "react-icons/fa"

import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"
import { VADSettingsPanel } from "./VADSettingsPanel"

export const VADSelector: React.FC = () => {
  const [config] = useRBox(configBox)
  const setConfig = set(configBox)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const setEnableVAD = (value: boolean) =>
    setConfig({ ...config, enableVAD: value })

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block font-semibold">
          Use VAD (Voice Activity Detection):
        </label>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="Advanced VAD Settings"
        >
          <FaCog size={16} />
        </button>
      </div>
      
      <select
        value={String(config.enableVAD)}
        onChange={(e) => {
          const value = e.target.value === "true"
          localStorage.setItem("enableVAD", String(value))
          setEnableVAD(value)
        }}
        className="p-2 border rounded-md w-full mb-2"
      >
        <option value={String(true)}>Enabled</option>
        <option value={String(false)}>Disabled</option>
      </select>

      {showAdvanced && config.enableVAD && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
          <VADSettingsPanel />
        </div>
      )}
    </div>
  )
}
