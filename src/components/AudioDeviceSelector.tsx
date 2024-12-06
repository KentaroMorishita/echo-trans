import React from "react"

import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"

import { Task, Either } from "f-box-core"
import { Map } from "./Map"
import { handleError } from "../services/handleError"

export const AudioDeviceSelector: React.FC = () => {
  const [config] = useRBox(configBox)
  const setConfig = set(configBox)

  const setSelectedDeviceId = (value: string) =>
    setConfig({ ...config, selectedDeviceId: value })

  const [devices, devicesBox] = useRBox<MediaDeviceInfo[]>([])
  const setDevices = set(devicesBox)

  const fetchDevices = () =>
    Task.tryCatch<Either<Error, void>>(
      () =>
        new Promise(async () => {
          const allDevices = await navigator.mediaDevices.enumerateDevices()
          const audioDevices = allDevices.filter((v) => v.kind === "audioinput")
          setDevices(audioDevices)

          if (audioDevices.length > 0 && !config.selectedDeviceId) {
            setSelectedDeviceId(audioDevices[0].deviceId)
          }
        }),
      handleError
    ).run()

  useRBox(() => {
    fetchDevices()
    navigator.mediaDevices.ondevicechange = fetchDevices
  })

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
