import React, { useEffect, useState } from "react"

type AudioDeviceSelectorProps = {
  selectedDeviceId: string
  setSelectedDeviceId: (deviceId: string) => void
}

const AudioDeviceSelector: React.FC<AudioDeviceSelectorProps> = ({
  selectedDeviceId,
  setSelectedDeviceId,
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices()
        const audioDevices = allDevices.filter(
          (device) => device.kind === "audioinput"
        )
        setDevices(audioDevices)

        if (audioDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioDevices[0].deviceId)
        }
      } catch (err) {
        console.error("デバイス取得エラー:", err)
      }
    }

    fetchDevices()

    // デバイスの変更を監視
    navigator.mediaDevices.ondevicechange = fetchDevices

    return () => {
      navigator.mediaDevices.ondevicechange = null
    }
  }, [selectedDeviceId, setSelectedDeviceId])

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Select Audio Device:</label>
      <select
        value={selectedDeviceId}
        onChange={(e) => setSelectedDeviceId(e.target.value)}
        className="p-2 border rounded-md w-full"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Audio Device ${device.deviceId}`}
          </option>
        ))}
      </select>
    </div>
  )
}

export default AudioDeviceSelector
