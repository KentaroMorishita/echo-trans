import React, { useState } from "react"

type Props = {
  onAudioData: (data: Blob) => void
}

const AudioRecorder: React.FC<Props> = ({ onAudioData }) => {
  const [isRecording, setIsRecording] = useState(false)

  const startRecording = () => {
    setIsRecording(true)
    // 音声録音のロジックを追加予定
  }

  const stopRecording = () => {
    setIsRecording(false)
    // 音声データを取得し、onAudioDataに渡すロジックを追加予定
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

      {/* パルスアニメーション */}
      {isRecording && (
        <div className="ml-4 h-4 w-4 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </div>
  )
}

export default AudioRecorder
