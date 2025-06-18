import React from "react"
import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"
import { saveVADSettings } from "../utils/vadSettingsLoader"

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
      startThreshold: -16,        // -16 dB で発話開始
      stopThreshold: -20,         // -20 dB で発話停止
      minSpeechDuration: 200,     // 最低200ms発話
      minSilenceDuration: 200,    // 最低200ms沈黙
      smoothingFactor: 0.9,       // 平滑化係数（90%）
    }
    console.log("resetToDefaults - resetting to:", defaultSettings)
    setConfig({ ...config, vadSettings: defaultSettings })
    saveVADSettings(defaultSettings)
    console.log("resetToDefaults - localStorage after save:", localStorage.getItem("vadSettings"))
  }


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">Voice Activity Detection (VAD)</h3>
          <p className="text-sm text-gray-600 mt-1">
            Automatically adjust VAD thresholds based on your environment
          </p>
        </div>
        <button
          onClick={resetToDefaults}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors whitespace-nowrap"
        >
          Reset to Default
        </button>
      </div>


      <div className="space-y-3">
        {/* Start Threshold */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Speech Start Threshold: {config.vadSettings.startThreshold} dB
          </label>
          <input
            type="range"
            min="-60"
            max="0"
            step="1"
            value={config.vadSettings.startThreshold}
            onChange={(e) => updateVADSetting("startThreshold", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>High Sensitivity</span>
            <span>Normal</span>
            <span>Low Sensitivity</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sound level required to start recording. Use <strong>higher sensitivity (left)</strong> in quiet environments, <strong>lower sensitivity (right)</strong> in noisy environments.
          </p>
        </div>

        {/* Stop Threshold */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Speech Stop Threshold: {config.vadSettings.stopThreshold} dB
          </label>
          <input
            type="range"
            min="-60"
            max="0"
            step="1"
            value={config.vadSettings.stopThreshold}
            onChange={(e) => updateVADSetting("stopThreshold", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>High Sensitivity</span>
            <span>Normal</span>
            <span>Low Sensitivity</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sound level required to stop recording. Should be <strong>lower than start threshold</strong> to prevent interruptions during speech.
          </p>
        </div>

        {/* Min Speech Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Minimum Speech Duration: {(config.vadSettings.minSpeechDuration / 1000).toFixed(1)}s
          </label>
          <input
            type="range"
            min="100"
            max="1000"
            step="50"
            value={config.vadSettings.minSpeechDuration}
            onChange={(e) => updateVADSetting("minSpeechDuration", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Short (0.1s)</span>
            <span>Normal (0.5s)</span>
            <span>Long (1.0s)</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Minimum duration to speak before recording starts. <strong>Shorter values are more responsive</strong>, <strong>longer values reduce false triggers</strong>.
          </p>
        </div>

        {/* Min Silence Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Minimum Silence Duration: {(config.vadSettings.minSilenceDuration / 1000).toFixed(1)}s
          </label>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={config.vadSettings.minSilenceDuration}
            onChange={(e) => updateVADSetting("minSilenceDuration", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Short (0.2s)</span>
            <span>Normal (1.0s)</span>
            <span>Long (2.0s)</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Duration of silence before stopping recording. <strong>Shorter values stop quickly</strong>, <strong>longer values continue recording through pauses</strong>.
          </p>
        </div>

        {/* Smoothing Factor */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Volume Smoothing: {Math.round(config.vadSettings.smoothingFactor * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.vadSettings.smoothingFactor}
            onChange={(e) => updateVADSetting("smoothingFactor", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Sensitive (0%)</span>
            <span>Normal (70%)</span>
            <span>Stable (100%)</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Smooths volume changes over time. <strong>Lower values are more sensitive</strong>, <strong>higher values provide more stable operation</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}