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
  const frameCountRef = useRef(0)

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

      // フレームレートを下げて安定化（30fps → 10fps）
      frameCountRef.current++
      if (frameCountRef.current % 6 === 0) {
        analyser.getByteTimeDomainData(dataArray)
        const rms = calculateRMS(dataArray)
        setCurrentLevel(rms)
      }

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

  if (!isRecording) {
    return null // 録音中でない場合は非表示
  }

  return (
    <div className="flex items-center gap-1">
      {/* 極小バーメーター */}
      <div className="relative w-1.5 h-6 bg-gray-200 rounded-full">
        <div
          className={`absolute bottom-0 w-full rounded-full transition-all duration-100 ${
            isSpeaking ? 'bg-blue-500' : isSilent ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{
            height: `${Math.min(100, Math.max(2, currentLevel))}%`,
          }}
        />
      </div>

      {/* 数値表示 */}
      <span className={`text-xs font-mono w-6 text-right ${isSpeaking ? 'text-blue-600' : isSilent ? 'text-green-600' : 'text-yellow-600'}`}>
        {currentLevel.toFixed(0).padStart(2, ' ')}
      </span>
    </div>
  )
}