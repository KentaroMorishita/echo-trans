import React from "react"
import { VADSelector } from "../VADSelector"
import { AudioDeviceSelector } from "../AudioDeviceSelector"

export const AudioSettingsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <VADSelector />
      <AudioDeviceSelector />
    </div>
  )
}