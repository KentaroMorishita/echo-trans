import React from "react"
import { AudioDeviceSelector } from "../AudioDeviceSelector"

export const AudioSettingsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <AudioDeviceSelector />
    </div>
  )
}