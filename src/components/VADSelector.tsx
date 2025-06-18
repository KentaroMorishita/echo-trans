import React from "react"

import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"
import { VADSettingsPanel } from "./VADSettingsPanel"

export const VADSelector: React.FC = () => {
  const [config] = useRBox(configBox)
  const setConfig = set(configBox)

  const setEnableVAD = (value: boolean) =>
    setConfig({ ...config, enableVAD: value })

  return (
    <div className="mb-4">
      <div className="mb-2">
        <label className="block font-semibold">
          Use VAD (Voice Activity Detection):
        </label>
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

      <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
        <VADSettingsPanel />
      </div>
    </div>
  )
}
