import React, { useState, useRef, useEffect } from "react"
import { FaPlay, FaStop, FaCheckCircle } from "react-icons/fa"
import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"
import { saveVADSettings } from "../utils/vadSettingsLoader"

export const VADCalibrationPanel: React.FC = () => {
  const [config] = useRBox(configBox)
  const setConfig = set(configBox)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationStep, setCalibrationStep] = useState<'idle' | 'silence' | 'speaking' | 'complete'>('idle')
  const [calibrationData, setCalibrationData] = useState<{
    silenceLevel: number
    speakingLevel: number
  } | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const calibrationTimerRef = useRef<number | null>(null)
  const calibrationValuesRef = useRef<number[]>([])

  const calculateRMS = (data: Uint8Array): number => {
    let sumSquares = 0
    for (let i = 0; i < data.length; i++) {
      const normalized = data[i] / 128.0 - 1.0
      sumSquares += normalized * normalized
    }
    return Math.sqrt(sumSquares / data.length) * 100
  }

  const startCalibration = async () => {
    try {
      setIsCalibrating(true)
      setCalibrationStep('silence')
      setCalibrationData(null)
      calibrationValuesRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 2,
          sampleRate: 48000,
          autoGainControl: true,
          echoCancellation: false,
          noiseSuppression: false,
        },
      })

      streamRef.current = stream
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0
      analyserRef.current = analyser

      source.connect(analyser)

      // 5秒間の環境音測定
      const measureEnvironment = () => {
        if (!analyserRef.current) return

        const bufferLength = analyserRef.current.fftSize
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteTimeDomainData(dataArray)
        
        const rms = calculateRMS(dataArray)
        calibrationValuesRef.current.push(rms)

        if (calibrationValuesRef.current.length < 250) { // 5秒間 (50回/秒 * 5)
          requestAnimationFrame(measureEnvironment)
        } else {
          // 環境音測定完了
          const avgSilenceLevel = calibrationValuesRef.current.reduce((a, b) => a + b, 0) / calibrationValuesRef.current.length
          
          setCalibrationData(prev => ({ 
            ...prev, 
            silenceLevel: avgSilenceLevel 
          } as any))
          
          setCalibrationStep('speaking')
          calibrationValuesRef.current = []
          
          // 3秒間の発話測定
          calibrationTimerRef.current = window.setTimeout(() => {
            measureSpeaking()
          }, 1000)
        }
      }

      const measureSpeaking = () => {
        if (!analyserRef.current) return

        const bufferLength = analyserRef.current.fftSize
        const dataArray = new Uint8Array(bufferLength)
        
        const collectSpeechData = () => {
          if (!analyserRef.current) return
          
          analyserRef.current.getByteTimeDomainData(dataArray)
          const rms = calculateRMS(dataArray)
          calibrationValuesRef.current.push(rms)

          if (calibrationValuesRef.current.length < 150) { // 3秒間
            requestAnimationFrame(collectSpeechData)
          } else {
            // 発話測定完了
            const avgSpeakingLevel = calibrationValuesRef.current.reduce((a, b) => a + b, 0) / calibrationValuesRef.current.length
            
            setCalibrationData(prev => ({
              ...prev!,
              speakingLevel: avgSpeakingLevel
            }))
            
            setCalibrationStep('complete')
          }
        }
        
        collectSpeechData()
      }

      measureEnvironment()

    } catch (error) {
      console.error("Calibration error:", error)
      stopCalibration()
    }
  }

  const stopCalibration = () => {
    setIsCalibrating(false)
    setCalibrationStep('idle')
    
    if (calibrationTimerRef.current) {
      clearTimeout(calibrationTimerRef.current)
      calibrationTimerRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
  }

  const applyCalibration = () => {
    if (!calibrationData) return

    // 適切なマージンを持ったしきい値を計算
    const silenceThreshold = Math.max(5, calibrationData.silenceLevel + 3)
    const speakingThreshold = Math.max(silenceThreshold + 5, calibrationData.speakingLevel - 5)

    const newVADSettings = {
      ...config.vadSettings,
      silenceThreshold,
      speakingThreshold,
    }

    setConfig({ ...config, vadSettings: newVADSettings })
    saveVADSettings(newVADSettings)
    
    stopCalibration()
  }

  useEffect(() => {
    return () => {
      stopCalibration()
    }
  }, [])

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-blue-800">Environment Calibration</h4>
        {calibrationStep === 'complete' && (
          <FaCheckCircle className="text-green-600" size={20} />
        )}
      </div>
      
      <p className="text-sm text-gray-600">
        Automatically adjust VAD thresholds based on your environment
      </p>

      {calibrationStep === 'idle' && (
        <button
          onClick={startCalibration}
          disabled={isCalibrating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <FaPlay size={14} />
          Start Calibration
        </button>
      )}

      {calibrationStep === 'silence' && (
        <div className="text-center">
          <div className="animate-pulse text-blue-600 font-medium mb-2">
            Measuring background noise...
          </div>
          <p className="text-sm text-gray-500">
            Please stay quiet for 5 seconds
          </p>
          <button
            onClick={stopCalibration}
            className="mt-2 flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <FaStop size={12} />
            Cancel
          </button>
        </div>
      )}

      {calibrationStep === 'speaking' && (
        <div className="text-center">
          <div className="animate-pulse text-green-600 font-medium mb-2">
            Measuring speech level...
          </div>
          <p className="text-sm text-gray-500">
            Please speak normally for 3 seconds
          </p>
          <button
            onClick={stopCalibration}
            className="mt-2 flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <FaStop size={12} />
            Cancel
          </button>
        </div>
      )}

      {calibrationStep === 'complete' && calibrationData && (
        <div className="space-y-3">
          <div className="text-sm">
            <div className="flex justify-between">
              <span>Background noise:</span>
              <span className="font-mono">{calibrationData.silenceLevel.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Speech level:</span>
              <span className="font-mono">{calibrationData.speakingLevel.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={applyCalibration}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Apply Settings
            </button>
            <button
              onClick={stopCalibration}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}