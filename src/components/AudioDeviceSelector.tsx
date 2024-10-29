import React, { useEffect, useState } from "react"
import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither"
import { Map } from "./Map"
import { handleError } from "../services/handleError"

export type AudioDeviceSelectorProps = {
  selectedDeviceId: string
  setSelectedDeviceId: (deviceId: string) => void
}

export const AudioDeviceSelector: React.FC<AudioDeviceSelectorProps> = ({
  selectedDeviceId,
  setSelectedDeviceId,
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    const fetchDevices: TaskEither<Error, void> = tryCatch(async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const audioDevices = allDevices.filter((v) => v.kind === "audioinput")
      setDevices(audioDevices)

      if (audioDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioDevices[0].deviceId)
      }
    }, handleError)

    fetchDevices()

    navigator.mediaDevices.ondevicechange = fetchDevices

    return () => {
      navigator.mediaDevices.ondevicechange = null
    }
  }, [])

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Select Audio Device:</label>
      <select
        value={selectedDeviceId}
        onChange={(e) => {
          const deviceId = e.target.value
          localStorage.setItem("selectedDeviceId", deviceId)
          setSelectedDeviceId(deviceId)
        }}
        className="p-2 border rounded-md w-full"
      >
        <Map items={devices}>
          {(device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Audio Device ${device.deviceId}`}
            </option>
          )}
        </Map>
      </select>
    </div>
  )
}
