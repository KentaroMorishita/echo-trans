import React, { useState, useRef, useEffect } from "react"

type Props = {
  onAudioData: (data: Blob) => void
}

const AudioRecorder: React.FC<Props> = ({ onAudioData }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // 利用可能なデバイスを取得
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput"
      )
      setDevices(audioDevices)

      // 最初のデバイスをデフォルト選択
      if (audioDevices.length > 0) {
        setSelectedDeviceId(audioDevices[0].deviceId)
      }
    })
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          channelCount: 2,
          sampleRate: 48000,
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
        },
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onAudioData(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("録音開始エラー:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="flex items-end space-y-4 gap-4">
      {/* デバイス選択ドロップダウン */}
      <div>
        <label className="block font-semibold mb-2">Select Audio Device:</label>
        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="p-2 border rounded-md"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Audio Device ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      {/* 録音コントロール */}
      <div className="flex items-center space-x-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`px-4 py-2 font-semibold text-white rounded-lg shadow-md ${
            isRecording
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`px-4 py-2 font-semibold text-white rounded-lg shadow-md ${
            !isRecording
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          Stop Recording
        </button>
      </div>

      {/* 録音した音声の再生 */}
      {audioUrl && (
        <div className="ml-4">
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  )
}

export default AudioRecorder
