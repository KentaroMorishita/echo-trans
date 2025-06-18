import React from "react"
import { VADSelector } from "../VADSelector"
import { AudioDeviceSelector } from "../AudioDeviceSelector"
import { RecordingModeSelector } from "../RecordingModeSelector"

export const AudioSettingsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <RecordingModeSelector />
      <VADSelector />
      <AudioDeviceSelector />
    </div>
  )
}