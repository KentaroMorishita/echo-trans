import React from "react"
import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"
import { saveVADSettings } from "../utils/vadSettingsLoader"
import { VADCalibrationPanel } from "./VADCalibrationPanel"

export const VADSettingsPanel: React.FC = () => {
  const [config] = useRBox(configBox)
  const setConfig = set(configBox)

  console.log("VADSettingsPanel render - current vadSettings:", config.vadSettings)

  const updateVADSetting = (key: keyof typeof config.vadSettings, value: number) => {
    const newVADSettings = { ...config.vadSettings, [key]: value }
    console.log("updateVADSetting - updating:", key, "to:", value)
    console.log("updateVADSetting - new settings:", newVADSettings)

    // 状態を更新
    setConfig({ ...config, vadSettings: newVADSettings })

    // localStorage に保存
    saveVADSettings(newVADSettings)

    // 保存確認
    console.log("updateVADSetting - localStorage after save:", localStorage.getItem("vadSettings"))
  }

  const resetToDefaults = () => {
    const defaultSettings = {
      speakingThreshold: 25,
      silenceThreshold: 15,
      silenceDuration: 10,
    }
    console.log("resetToDefaults - resetting to:", defaultSettings)
    setConfig({ ...config, vadSettings: defaultSettings })
    saveVADSettings(defaultSettings)
    console.log("resetToDefaults - localStorage after save:", localStorage.getItem("vadSettings"))
  }

  const applyPreset = (preset: typeof config.vadSettings) => {
    console.log("applyPreset - applying preset:", preset)
    setConfig({ ...config, vadSettings: preset })
    saveVADSettings(preset)
    console.log("applyPreset - localStorage after save:", localStorage.getItem("vadSettings"))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">VAD Settings</h3>
        <button
          onClick={resetToDefaults}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Calibration Panel */}
      <VADCalibrationPanel />

      <div className="space-y-3">
        {/* Speaking Threshold */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Speaking Threshold: {config.vadSettings.speakingThreshold}
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={config.vadSettings.speakingThreshold}
            onChange={(e) => updateVADSetting("speakingThreshold", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Higher values require louder speech to trigger detection
          </p>
        </div>

        {/* Silence Threshold */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Silence Threshold: {config.vadSettings.silenceThreshold}
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={config.vadSettings.silenceThreshold}
            onChange={(e) => updateVADSetting("silenceThreshold", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lower values detect silence more easily
          </p>
        </div>

        {/* Silence Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Silence Duration: {config.vadSettings.silenceDuration}ms
          </label>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={config.vadSettings.silenceDuration}
            onChange={(e) => updateVADSetting("silenceDuration", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            How long to wait before considering speech as ended
          </p>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="pt-3 border-t">
        <p className="text-sm font-medium mb-2">Environment Presets:</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => applyPreset({ speakingThreshold: 15, silenceThreshold: 8, silenceDuration: 10 })}
            className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded transition-colors"
          >
            Quiet Room
          </button>
          <button
            onClick={() => applyPreset({ speakingThreshold: 25, silenceThreshold: 15, silenceDuration: 40 })}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
          >
            Normal
          </button>
          <button
            onClick={() => applyPreset({ speakingThreshold: 40, silenceThreshold: 25, silenceDuration: 20 })}
            className="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 rounded transition-colors"
          >
            Noisy Environment
          </button>
        </div>
      </div>
    </div>
  )
}