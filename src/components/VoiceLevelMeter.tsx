import React from "react"

type VoiceLevelMeterProps = {
  isRecording: boolean
  currentLevel: number
  isSpeaking: boolean
}

export const VoiceLevelMeter: React.FC<VoiceLevelMeterProps> = ({
  isRecording,
  currentLevel,
  isSpeaking,
}) => {

  if (!isRecording) {
    return null // 録音中でない場合は非表示
  }

  return (
    <div className="flex items-center gap-1">
      {/* 極小バーメーター */}
      <div className="relative w-1.5 h-6 bg-gray-200 rounded-full">
        <div
          className={`absolute bottom-0 w-full rounded-full transition-all duration-100 ${
            isSpeaking ? 'bg-blue-500' : 'bg-gray-400'
          }`}
          style={{
            height: `${Math.min(100, Math.max(2, currentLevel))}%`,
          }}
        />
      </div>

      {/* 数値表示 */}
      <span className={`text-xs font-mono w-6 text-right ${isSpeaking ? 'text-blue-600' : 'text-gray-500'}`}>
        {currentLevel.toFixed(0).padStart(2, ' ')}
      </span>
    </div>
  )
}