import React from "react"

import { useRBox } from "../hooks/useRBox"
import { configBox } from "../box/config"

export const VADSelector: React.FC = () => {
  const [config] = useRBox(configBox)
  const setEnableVAD = (value: boolean) => {
    configBox.setValue((config) => ({ ...config, enableVAD: value }))
  }

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">
        Use VAD (Voice Activity Detection):
      </label>
      <select
        value={String(config.enableVAD)}
        onChange={(e) => {
          const value = e.target.value === "true"
          localStorage.setItem("enableVAD", String(value))
          setEnableVAD(value)
        }}
        className="p-2 border rounded-md w-full"
      >
        <option value={String(true)}>Enabled</option>
        <option value={String(false)}>Disabled</option>
      </select>
    </div>
  )
}
