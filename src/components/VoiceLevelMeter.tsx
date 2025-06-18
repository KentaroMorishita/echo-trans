import React, { useRef, useEffect, useState } from "react"
import { useRBox } from "f-box-react"
import { configBox } from "../box/config"

type VoiceLevelMeterProps = {
  isRecording: boolean
  analyserRef: React.RefObject<AnalyserNode | null>
}

export const VoiceLevelMeter: React.FC<VoiceLevelMeterProps> = ({
  isRecording,
  analyserRef,
}) => {
  const [config] = useRBox(configBox)
  const [currentLevel, setCurrentLevel] = useState(0)
  const animationFrameIdRef = useRef<number | null>(null)

  const calculateRMS = (data: Uint8Array): number => {
    let sumSquares = 0
    for (let i = 0; i < data.length; i++) {
      const normalized = data[i] / 128.0 - 1.0
      sumSquares += normalized * normalized
    }
    return Math.sqrt(sumSquares / data.length) * 100
  }

  useEffect(() => {
    if (!isRecording || !analyserRef.current) {
      setCurrentLevel(0)
      return
    }

    const analyser = analyserRef.current
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)

    const updateLevel = () => {
      if (!analyser) return

      analyser.getByteTimeDomainData(dataArray)
      const rms = calculateRMS(dataArray)
      setCurrentLevel(rms)

      animationFrameIdRef.current = requestAnimationFrame(updateLevel)
    }

    updateLevel()

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
        animationFrameIdRef.current = null
      }
    }
  }, [isRecording, analyserRef])

  const { speakingThreshold, silenceThreshold } = config.vadSettings
  const isSpeaking = currentLevel > speakingThreshold
  const isSilent = currentLevel < silenceThreshold

  return (
    <div className="flex flex-col items-center gap-2 min-w-[120px]">
      {/* 数値表示 */}
      <div className="text-sm font-mono text-center">
        <div className={`font-bold ${isSpeaking ? 'text-blue-600' : isSilent ? 'text-green-600' : 'text-yellow-600'}`}>
          {currentLevel.toFixed(1)}
        </div>
        <div className="text-xs text-gray-500">Level</div>
      </div>

      {/* バーメーター */}
      <div className="relative w-16 h-24 bg-gray-200 rounded border">
        {/* 現在のレベル */}
        <div
          className={`absolute bottom-0 w-full rounded transition-all duration-100 ${
            isSpeaking ? 'bg-blue-500' : isSilent ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{
            height: `${Math.min(100, Math.max(0, currentLevel))}%`,
          }}
        />
        
        {/* Speaking threshold line */}
        <div
          className="absolute w-full border-t-2 border-red-500 border-dashed"
          style={{
            bottom: `${Math.min(100, Math.max(0, speakingThreshold))}%`,
          }}
        />
        
        {/* Silence threshold line */}
        <div
          className="absolute w-full border-t-2 border-green-500 border-dashed"
          style={{
            bottom: `${Math.min(100, Math.max(0, silenceThreshold))}%`,
          }}
        />
      </div>

      {/* しきい値表示 */}
      <div className="text-xs text-center text-gray-500">
        <div>Speak: {speakingThreshold}</div>
        <div>Silence: {silenceThreshold}</div>
      </div>
    </div>
  )
}