import React from "react"
import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"
import { SpeechModel } from "../types"

const speechModelNames: Record<SpeechModel, string> = {
  "whisper-1": "Whisper-1 ($0.006/min)",
  "gpt-4o-mini-transcribe": "GPT-4o Mini Transcribe ($0.003/min)",
}

export const SpeechModelSelector: React.FC = () => {
  const [config] = useRBox(configBox)
  const setConfig = set(configBox)

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speechModel = e.target.value as SpeechModel
    setConfig({ ...config, speechModel })
    localStorage.setItem("speechModel", speechModel)
  }

  return (
    <div>
      <label className="block font-semibold mb-2">Speech Recognition Model:</label>
      <select
        value={config.speechModel}
        onChange={handleModelChange}
        className="w-full p-2 border rounded-md bg-white"
      >
        {Object.entries(speechModelNames).map(([model, name]) => (
          <option key={model} value={model}>
            {name}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 mt-1">
        GPT-4o Mini Transcribe offers better accuracy at half the cost
      </p>
    </div>
  )
}