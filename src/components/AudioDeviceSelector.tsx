import React, { useEffect } from "react"

import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"

import * as TaskEither from "fp-ts/lib/TaskEither"
import { Map } from "./Map"
import { handleError } from "../services/handleError"

export const AudioDeviceSelector: React.FC = () => {
  const [config] = useRBox(configBox)
  const setConfig = set(configBox)

  const setSelectedDeviceId = (value: string) =>
    setConfig({ ...config, selectedDeviceId: value })

  const [devices, devicesBox] = useRBox<MediaDeviceInfo[]>([])
  const setDevices = set(devicesBox)

  useEffect(() => {
    const fetchDevices: TaskEither.TaskEither<Error, void> =
      TaskEither.tryCatch(async () => {
        const allDevices = await navigator.mediaDevices.enumerateDevices()
        const audioDevices = allDevices.filter((v) => v.kind === "audioinput")
        setDevices(audioDevices)

        if (audioDevices.length > 0 && !config.selectedDeviceId) {
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
        value={config.selectedDeviceId}
        onChange={(e) => {
          const deviceId = e.target.value
          localStorage.setItem("selectedDeviceId", deviceId)
          setSelectedDeviceId(deviceId)
        }}
        className="p-2 border rounded-md w-full"
      >
        <Map items={devices}>
          {(device) => (
            <option value={device.deviceId}>
              {device.label || `Audio Device ${device.deviceId}`}
            </option>
          )}
        </Map>
      </select>
    </div>
  )
}
