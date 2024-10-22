import React, { useState, useRef } from "react"

type Props = {
  onAudioData: (data: Blob) => void
}

const AudioRecorder: React.FC<Props> = ({ onAudioData }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null) // デバッグ用の音声URL
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        })
        setAudioURL(URL.createObjectURL(audioBlob)) // デバッグ用にURLを生成
        onAudioData(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("マイクアクセスエラー:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
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

      {/* デバッグ用のaudioタグ */}
      {audioURL && (
        <div>
          <audio controls src={audioURL}></audio>
        </div>
      )}

      {isRecording && (
        <div className="ml-4 h-4 w-4 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </div>
  )
}

export default AudioRecorder
