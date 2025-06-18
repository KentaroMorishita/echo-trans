import React from "react"
import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"
import { RecordingMode } from "../types"

export const RecordingModeSelector: React.FC = () => {
  const [config] = useRBox(configBox)
  const setConfig = set(configBox)

  const handleModeChange = (mode: RecordingMode) => {
    setConfig({ ...config, recordingMode: mode })
    localStorage.setItem("recordingMode", mode)
  }

  return (
    <div>
      <label className="block font-semibold mb-2">Recording Mode:</label>
      <div className="flex gap-2">
        <button
          onClick={() => handleModeChange("manual")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            config.recordingMode === "manual"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => handleModeChange("auto")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            config.recordingMode === "auto"
              ? "bg-green-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Auto VAD
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {config.recordingMode === "manual" 
          ? "Click Start/Stop buttons to control recording"
          : "Recording starts/stops automatically based on voice detection"
        }
      </p>
    </div>
  )
}