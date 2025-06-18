import React, { useRef, useCallback } from "react"
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
    currentAudioLevel,
    startRecording,
    stopRecording,
    analyserRef,
    setIsSpeaking,
    setCurrentAudioLevel,
  } = useAudioRecorder(onAudioData)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // VAD状態更新のコールバック
  const handleSpeakingDetected = useCallback(() => {
    console.log("Speaking detected")
    setIsSpeaking(true)
    
    // 自動録音モードで話し声を検出したら録音開始
    if (config.recordingMode === "auto" && !isRecording) {
      startRecording()
    }
  }, [setIsSpeaking, config.recordingMode, isRecording, startRecording])

  const handleSilenceDetected = useCallback(() => {
    console.log("Silence detected")  
    setIsSpeaking(false)
    
    // 自動録音モードで無音を検出したら録音停止
    if (config.recordingMode === "auto" && isRecording) {
      stopRecording()
    }
  }, [setIsSpeaking, config.recordingMode, isRecording, stopRecording])

  const handleAudioLevelUpdate = useCallback((level: number) => {
    setCurrentAudioLevel(level)
  }, [setCurrentAudioLevel])

  // 波形描画とVADの初期化（設定から動的に取得）
  useWaveformVisualizer({
    isRecording,
    analyserRef,
    canvasRef,
    onSpeakingDetected: handleSpeakingDetected,
    onSilenceDetected: handleSilenceDetected,
    onAudioLevelUpdate: handleAudioLevelUpdate,
    thresholds: {
      speakingThreshold: config.vadSettings.speakingThreshold,
      silenceThreshold: config.vadSettings.silenceThreshold,
    },
    silenceDuration: config.vadSettings.silenceDuration,
    isAutoMode: config.recordingMode === "auto",
  })

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 p-4">
      <div className="flex items-center justify-between gap-4">
        {/* 左側: 録音コントロール */}
        <div className="flex gap-2">
          {config.recordingMode === "manual" ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 border border-green-200">
              <FaMicrophone className="mr-1.5 text-sm" />
              {isRecording ? 'Auto Recording...' : 'Auto VAD Ready'}
            </div>
          )}
        </div>

        {/* 中央: コンパクトな波形表示（録音中またはオートモード時） */}
        {(isRecording || config.recordingMode === "auto") && (
          <div className="flex-1 max-w-xs">
            <canvas
              ref={canvasRef}
              className="w-full h-8 bg-gray-800 rounded border border-gray-300"
            />
          </div>
        )}

        {/* 右側: ステータスインジケーター（録音中またはオートモード時） */}
        {(isRecording || config.recordingMode === "auto") && (
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
            <VoiceLevelMeter 
              isRecording={isRecording} 
              currentLevel={currentAudioLevel} 
              isSpeaking={isSpeaking}
            />
          </div>
        )}
      </div>
    </div>
  )
}
