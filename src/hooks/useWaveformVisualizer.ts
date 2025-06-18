import { useEffect, useRef } from "react"

type UseWaveformVisualizerProps = {
  isRecording: boolean
  analyserRef: React.RefObject<AnalyserNode | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onSpeakingDetected: () => void
  onSilenceDetected: () => void
  onAudioLevelUpdate?: (level: number) => void
  thresholds?: {
    speakingThreshold: number
    silenceThreshold: number
  }
  silenceDuration?: number
  isAutoMode?: boolean
}

export const useWaveformVisualizer = ({
  isRecording,
  analyserRef,
  canvasRef,
  onSpeakingDetected,
  onSilenceDetected,
  onAudioLevelUpdate,
  thresholds = {
    speakingThreshold: 25,
    silenceThreshold: 15,
  },
  silenceDuration = 100,
  isAutoMode = false,
}: UseWaveformVisualizerProps) => {
  const animationFrameIdRef = useRef<number | null>(null)
  const silenceTimerRef = useRef<number | null>(null)
  const isSpeakingRef = useRef(false)

  const calculateRMS = (data: Uint8Array): number => {
    let sumSquares = 0
    for (let i = 0; i < data.length; i++) {
      const normalized = (data[i] - 128) / 128.0
      sumSquares += normalized * normalized
    }
    const rms = Math.sqrt(sumSquares / data.length)
    // ノイズフロアを考慮して0から100にスケール
    const scaled = Math.max(0, (rms - 0.001) * 100)
    return scaled
  }

  useEffect(() => {
    // 録音中またはオートモード時にVAD処理を実行
    if ((!isRecording && !isAutoMode) || !analyserRef.current || !canvasRef.current) return

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

      // 音声レベルを更新
      if (onAudioLevelUpdate) {
        onAudioLevelUpdate(rms)
      }

      // VAD判定
      console.log(`VAD: rms=${rms.toFixed(2)}, speaking=${thresholds.speakingThreshold}, silence=${thresholds.silenceThreshold}, isSpeaking=${isSpeakingRef.current}`)

      if (rms > thresholds.speakingThreshold) {
        // Speaking threshold を超えた場合
        if (!isSpeakingRef.current) {
          console.log("VAD: Transitioning to speaking state")
          isSpeakingRef.current = true
          onSpeakingDetected()
        }
        // 既存のsilenceTimerをクリア
        if (silenceTimerRef.current !== null) {
          console.log("VAD: Clearing silence timer due to speaking")
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
      } else {
        // Speaking threshold 以下の場合（silenceThreshold関係なく）
        if (isSpeakingRef.current && silenceTimerRef.current === null) {
          console.log(`VAD: Starting silence timer (duration: ${silenceDuration}ms)`)
          silenceTimerRef.current = window.setTimeout(() => {
            console.log("VAD: Silence timeout triggered, transitioning to silent state")
            isSpeakingRef.current = false
            onSilenceDetected()
            silenceTimerRef.current = null
          }, silenceDuration)
        } else if (isSpeakingRef.current && silenceTimerRef.current !== null) {
          console.log("VAD: Already waiting for silence timeout")
        } else if (!isSpeakingRef.current) {
          console.log("VAD: Already in silent state")
        }
      }

      // VADしきい値線の描画
      const speakingY = (canvas.height * (100 - thresholds.speakingThreshold)) / 100
      const silenceY = (canvas.height * (100 - thresholds.silenceThreshold)) / 100

      // Speaking threshold line (red)
      canvasCtx.strokeStyle = "rgba(239, 68, 68, 0.8)"
      canvasCtx.lineWidth = 1
      canvasCtx.setLineDash([5, 5])
      canvasCtx.beginPath()
      canvasCtx.moveTo(0, speakingY)
      canvasCtx.lineTo(canvas.width, speakingY)
      canvasCtx.stroke()

      // Silence threshold line (green)
      canvasCtx.strokeStyle = "rgba(34, 197, 94, 0.8)"
      canvasCtx.beginPath()
      canvasCtx.moveTo(0, silenceY)
      canvasCtx.lineTo(canvas.width, silenceY)
      canvasCtx.stroke()
      canvasCtx.setLineDash([])

      // 現在の音声レベル表示
      const currentLevelY = (canvas.height * (100 - rms)) / 100
      canvasCtx.fillStyle = isSpeakingRef.current ? "rgba(59, 130, 246, 0.8)" : "rgba(156, 163, 175, 0.8)"
      canvasCtx.fillRect(canvas.width - 10, currentLevelY, 8, canvas.height - currentLevelY)

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
    isAutoMode,
    analyserRef,
    canvasRef,
    thresholds.speakingThreshold,
    thresholds.silenceThreshold,
    silenceDuration,
    onSpeakingDetected,
    onSilenceDetected,
    onAudioLevelUpdate,
  ])
}
