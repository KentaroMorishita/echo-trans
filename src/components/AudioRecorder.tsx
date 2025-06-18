import React, { useRef } from "react"
import { FaMicrophone, FaStop } from "react-icons/fa"
import { useRBox } from "f-box-react"
import { useAudioRecorder } from "../hooks/useAudioRecorder"
import { useWaveformVisualizer } from "../hooks/useWaveformVisualizer"
import { VoiceLevelMeter } from "./VoiceLevelMeter"
import { configBox } from "../box/config"

export type AudioRecorderProps = {
  onAudioData: (data: Blob) => void
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioData,
}) => {
  const [config] = useRBox(configBox)
  const {
    isRecording,
    isSpeaking,
    startRecording,
    stopRecording,
    analyserRef,
  } = useAudioRecorder(onAudioData)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // 波形描画とVADの初期化（設定から動的に取得）
  useWaveformVisualizer({
    isRecording,
    analyserRef,
    canvasRef,
    onSpeakingDetected: () => console.log("Speaking detected"),
    onSilenceDetected: () => console.log("Silence detected"),
    thresholds: {
      speakingThreshold: config.vadSettings.speakingThreshold,
      silenceThreshold: config.vadSettings.silenceThreshold,
    },
    silenceDuration: config.vadSettings.silenceDuration,
  })

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 p-4">
      <div className="flex items-center justify-between gap-4">
        {/* 左側: 録音コントロール */}
        <div className="flex gap-2">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isRecording
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            }`}
          >
            <FaMicrophone className="mr-1.5 text-sm" />
            {isRecording ? 'Recording...' : 'Record'}
          </button>

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all duration-200"
            >
              <FaStop className="mr-1.5 text-sm" />
              Stop
            </button>
          )}
        </div>

        {/* 中央: コンパクトな波形表示（録音中のみ） */}
        {isRecording && (
          <div className="flex-1 max-w-xs">
            <canvas
              ref={canvasRef}
              className="w-full h-8 bg-gray-800 rounded border border-gray-300"
            />
          </div>
        )}

        {/* 右側: ステータスインジケーター（録音中のみ） */}
        {isRecording && (
          <div className="flex items-center gap-3">
            {/* VAD状態 */}
            <div className="flex items-center gap-1">
              {isSpeaking ? (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              )}
              <span className={`text-xs font-medium w-14 ${isSpeaking ? 'text-blue-600' : 'text-gray-500'}`}>
                {isSpeaking ? 'Speaking' : 'Silent'}
              </span>
            </div>

            {/* 音声レベルメーター */}
            <VoiceLevelMeter isRecording={isRecording} analyserRef={analyserRef} />
          </div>
        )}
      </div>
    </div>
  )
}
