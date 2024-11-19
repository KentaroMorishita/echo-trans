import React, { useRef } from "react"
import { FaMicrophone, FaStop, FaVolumeUp } from "react-icons/fa"
import { useAudioRecorder } from "../hooks/useAudioRecorder"
import { useWaveformVisualizer } from "../hooks/useWaveformVisualizer"

export type AudioRecorderProps = {
  onAudioData: (data: Blob) => void
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioData,
}) => {
  const {
    isRecording,
    isSpeaking,
    startRecording,
    stopRecording,
    analyserRef,
  } = useAudioRecorder(onAudioData)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // 波形描画とVADの初期化
  useWaveformVisualizer({
    isRecording,
    analyserRef,
    canvasRef,
    onSpeakingDetected: () => console.log("Speaking detected"),
    onSilenceDetected: () => console.log("Silence detected"),
  })

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* 録音コントロール */}
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

      {/* VADの状態表示 */}
      <div>
        {isSpeaking ? (
          <FaVolumeUp className="text-blue-500 text-2xl" title="Speaking" />
        ) : (
          <FaVolumeUp className="text-gray-300 text-2xl" title="Silent" />
        )}
      </div>

      {/* 波形描画用のキャンバス */}
      <canvas
        ref={canvasRef}
        className="w-80 h-12 bg-gray-500 rounded-full shadow-inner"
      />
    </div>
  )
}
