import React from "react"
import { FaMicrophone, FaStop } from "react-icons/fa"
import { useRBox } from "f-box-react"
import { useAudioRecorder } from "../hooks/useAudioRecorder"
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
    currentAudioLevel,
    vadState,
    startRecording,
    stopRecording,
  } = useAudioRecorder(onAudioData)

  // VAD状態の表示用ラベル
  const getVADStateLabel = () => {
    switch (vadState) {
      case 'speaking': return 'Speaking'
      case 'pending_speech': return 'Detecting...'
      case 'pending_silence': return 'Ending...'
      case 'silent': return 'Silent'
      default: return 'Silent'
    }
  }

  const getVADStateColor = () => {
    switch (vadState) {
      case 'speaking': return 'text-blue-600'
      case 'pending_speech': return 'text-yellow-600'
      case 'pending_silence': return 'text-orange-600'
      case 'silent': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 p-4">
      <div className="flex items-center justify-between gap-4">
        {/* 左側: 録音コントロール */}
        <div className="flex gap-2">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-28 ${
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
              onClick={() => stopRecording(true)}
              className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all duration-200"
            >
              <FaStop className="mr-1.5 text-sm" />
              Stop
            </button>
          )}
        </div>

        {/* 中央: 音声レベル表示（録音中またはVAD有効時） */}
        {(isRecording || config.enableVAD) && (
          <div className="flex-1 max-w-sm">
            <div className="text-xs text-gray-600 mb-1">
              Audio Level: {currentAudioLevel === -Infinity ? '-∞' : currentAudioLevel.toFixed(1)} dB
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-100 ${
                  vadState === 'speaking' ? 'bg-blue-500' : 
                  vadState === 'pending_speech' ? 'bg-yellow-500' :
                  vadState === 'pending_silence' ? 'bg-orange-500' :
                  'bg-gray-400'
                }`}
                style={{ 
                  width: `${Math.max(0, Math.min(100, ((currentAudioLevel + 100) / 100) * 100))}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-100dB</span>
              <span>0dB</span>
            </div>
          </div>
        )}

        {/* 右側: ステータスインジケーター（録音中またはVAD有効時） */}
        {(isRecording || config.enableVAD) && (
          <div className="flex items-center gap-3">
            {/* VAD状態 */}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                vadState === 'speaking' ? 'bg-blue-500 animate-pulse' :
                vadState === 'pending_speech' ? 'bg-yellow-500 animate-pulse' :
                vadState === 'pending_silence' ? 'bg-orange-500 animate-pulse' :
                'bg-gray-300'
              }`}></div>
              <span className={`text-xs font-medium w-20 ${getVADStateColor()}`}>
                {getVADStateLabel()}
              </span>
            </div>

            {/* しきい値インジケーター */}
            <div className="text-xs text-gray-500">
              <div>Start: {config.vadSettings.startThreshold}dB</div>
              <div>Stop: {config.vadSettings.stopThreshold}dB</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
