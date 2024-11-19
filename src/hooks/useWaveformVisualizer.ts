import { useEffect, useRef } from "react"

type UseWaveformVisualizerProps = {
  isRecording: boolean
  analyserRef: React.RefObject<AnalyserNode | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onSpeakingDetected: () => void
  onSilenceDetected: () => void
  thresholds?: {
    speakingThreshold: number
    silenceThreshold: number
  }
  silenceDuration?: number
}

export const useWaveformVisualizer = ({
  isRecording,
  analyserRef,
  canvasRef,
  onSpeakingDetected,
  onSilenceDetected,
  thresholds = {
    speakingThreshold: 25,
    silenceThreshold: 15,
  },
  silenceDuration = 1500,
}: UseWaveformVisualizerProps) => {
  const animationFrameIdRef = useRef<number | null>(null)
  const silenceTimerRef = useRef<number | null>(null)
  const isSpeakingRef = useRef(false)

  const calculateRMS = (data: Uint8Array): number => {
    let sumSquares = 0
    for (let i = 0; i < data.length; i++) {
      const normalized = data[i] / 128.0 - 1.0
      sumSquares += normalized * normalized
    }
    return Math.sqrt(sumSquares / data.length) * 100
  }

  useEffect(() => {
    if (!isRecording || !analyserRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const canvasCtx = canvas.getContext("2d")!
    const analyser = analyserRef.current
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)

    const drawWaveform = () => {
      analyser.getByteTimeDomainData(dataArray)

      // 波形の描画
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
      canvasCtx.fillStyle = "rgb(107, 114, 128)"
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

      canvasCtx.lineWidth = 2
      canvasCtx.strokeStyle = "rgb(255, 255, 255)"
      canvasCtx.lineJoin = "round"
      canvasCtx.lineCap = "round"
      canvasCtx.beginPath()

      const sliceWidth = (canvas.width * 1.0) / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        if (i === 0) {
          canvasCtx.moveTo(x, y)
        } else {
          canvasCtx.lineTo(x, y)
        }
        x += sliceWidth
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2)
      canvasCtx.stroke()

      // VAD処理
      const rms = calculateRMS(dataArray)
      if (rms > thresholds.speakingThreshold) {
        if (!isSpeakingRef.current) {
          isSpeakingRef.current = true
          onSpeakingDetected()
        }
        if (silenceTimerRef.current !== null) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
      } else if (rms < thresholds.silenceThreshold) {
        if (isSpeakingRef.current && silenceTimerRef.current === null) {
          silenceTimerRef.current = window.setTimeout(() => {
            isSpeakingRef.current = false
            onSilenceDetected()
            silenceTimerRef.current = null
          }, silenceDuration)
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(drawWaveform)
    }

    drawWaveform()

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
        animationFrameIdRef.current = null
      }
      if (silenceTimerRef.current !== null) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
    }
  }, [
    isRecording,
    analyserRef,
    canvasRef,
    thresholds.speakingThreshold,
    thresholds.silenceThreshold,
    silenceDuration,
    onSpeakingDetected,
    onSilenceDetected,
  ])
}
