import React, { useState, useRef, useEffect } from "react"
import { FaMicrophone, FaStop } from "react-icons/fa"

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
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput"
      )
      setDevices(audioDevices)

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
    <div className="flex flex-wrap items-end space-y-4 gap-4">
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
      <div className="flex items-center gap-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`flex items-center justify-center px-4 py-2 rounded-full transition-all duration-300 ${
            isRecording
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } shadow-lg text-white`}
        >
          <FaMicrophone className="mr-2 text-lg" />
          <span className="font-medium">Start</span>
        </button>

        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`flex items-center justify-center px-4 py-2 rounded-full transition-all duration-300 ${
            !isRecording
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          } shadow-lg text-white`}
        >
          <FaStop className="mr-2 text-lg" />
          <span className="font-medium">Stop</span>
        </button>
      </div>

      {/* 録音した音声の再生 */}
      {audioUrl && (
        <div>
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  )
}

export default AudioRecorder
