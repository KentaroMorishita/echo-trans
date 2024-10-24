import React, { useState, useRef, useEffect } from "react"
import { FaMicrophone, FaStop, FaVolumeUp } from "react-icons/fa"

export type AudioRecorderProps = {
  selectedDeviceId: string
  onAudioData: (data: Blob) => void
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  selectedDeviceId,
  onAudioData,
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null) // MediaStream の参照を追加

  // VAD関連の状態
  const [isSpeaking, setIsSpeaking] = useState(false)
  const isSpeakingRef = useRef<boolean>(false) // isSpeakingの最新状態を保持
  const speechStartRef = useRef<number | null>(null)
  const silenceTimerRef = useRef<number | null>(null) // 無音検出用のタイマー

  // 閾値設定（必要に応じて調整）
  const SPEAKING_THRESHOLD = 25 // 音声開始を判定する高めの閾値
  const SILENCE_THRESHOLD = 15 // 音声終了を判定する低めの閾値
  const MIN_SPEECH_DURATION = 500 // ミリ秒単位で音声と判定する最小期間
  const SILENCE_DURATION = 1500 // 音声終了と判定する無音期間（ミリ秒）

  // Canvasのサイズを設定
  const setCanvasSize = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      console.log(`Canvas size set to ${canvas.width}x${canvas.height}`)
    }
  }

  useEffect(() => {
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)
    return () => {
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [])

  const startRecording = async () => {
    try {
      console.log("Start recording...")

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          channelCount: 2,
          sampleRate: 48000,
          autoGainControl: true, // 自動ゲイン制御を有効にする
          echoCancellation: false,
          noiseSuppression: false,
        },
      })
      console.log("Audio stream obtained:", stream)
      streamRef.current = stream // MediaStream を保存

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0 // スムージング無効化

      // GainNodeの作成と設定
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 2.0 // 増幅率を設定（必要に応じて調整）
      gainNodeRef.current = gainNode

      console.log("Connecting source to GainNode...")
      source.connect(gainNode)
      console.log("Connecting GainNode to AnalyserNode...")
      gainNode.connect(analyser)
      analyserRef.current = analyser
      console.log(
        "MediaStreamAudioSourceNode connected through GainNode:",
        source
      )

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        console.log("Recording stopped, audio blob created:", audioBlob)
        onAudioData(audioBlob)
      }

      mediaRecorder.start(50)
      setIsRecording(true)
      isSpeakingRef.current = false // isSpeakingRefを初期化
      setIsSpeaking(false) // isSpeakingを初期化
      speechStartRef.current = null
      if (silenceTimerRef.current !== null) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
      console.log("MediaRecorder started with 50ms timeslice")
    } catch (err) {
      console.error("録音開始エラー:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      console.log("Recording stopped manually")

      // MediaStream の停止
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      // AudioContext のクローズと参照のクリア
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      analyserRef.current = null
      gainNodeRef.current = null

      // アニメーションフレームのキャンセル
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
        animationFrameIdRef.current = null
      }

      // タイマーのクリア
      if (silenceTimerRef.current !== null) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }

      isSpeakingRef.current = false
      setIsSpeaking(false) // isSpeakingを初期化
    }
  }

  // 波形の描画とVADの実装
  useEffect(() => {
    if (!isRecording) {
      // 録音が停止したら描画とVADを停止
      return
    }

    if (!analyserRef.current || !canvasRef.current) {
      console.log("Analyser or canvas not available")
      return
    }

    const canvas = canvasRef.current
    const canvasCtx = canvas.getContext("2d")!
    const analyser = analyserRef.current
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)

    console.log("Start visualizing waveform and VAD...")

    const drawWaveform = () => {
      analyser.getByteTimeDomainData(dataArray)

      // 波形の描画
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
      canvasCtx.fillStyle = "rgb(107, 114, 128)"
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

      // 波形の描画設定
      canvasCtx.lineWidth = 2 // 太さを調整
      canvasCtx.strokeStyle = "rgb(255, 255, 255)"
      canvasCtx.lineJoin = "round"
      canvasCtx.lineCap = "round"
      canvasCtx.beginPath()

      const sliceWidth = (canvas.width * 1.0) / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0 // 正規化（0〜2の範囲）
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

      // VADの実装
      const rms = calculateRMS(dataArray)
      console.log(`Calculated RMS: ${rms}`)

      if (rms > SPEAKING_THRESHOLD) {
        if (!isSpeakingRef.current) {
          // 音声開始
          setIsSpeaking(true)
          isSpeakingRef.current = true
          speechStartRef.current = performance.now()
          console.log("VAD: Speech started")
        }

        // もし無音タイマーがセットされていたらクリア
        if (silenceTimerRef.current !== null) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
          console.log("VAD: Silence timer cleared")
        }
      } else if (rms < SILENCE_THRESHOLD) {
        if (isSpeakingRef.current && silenceTimerRef.current === null) {
          // 無音タイマーを開始
          silenceTimerRef.current = window.setTimeout(() => {
            // 無音期間がSILENCE_DURATIONを超えた場合、音声終了と判定
            setIsSpeaking(false)
            isSpeakingRef.current = false
            const speechEnd = performance.now()
            const speechDuration = speechEnd - (speechStartRef.current || 0)
            console.log(`VAD: Speech ended, duration: ${speechDuration}ms`)

            if (speechDuration > MIN_SPEECH_DURATION) {
              console.log(
                "VAD: Speech duration exceeded threshold, stopping recording"
              )
              // 録音を停止して音声データを処理
              stopRecording()
              // 再度録音を開始
              setTimeout(() => {
                startRecording()
                console.log("VAD: Recording restarted for next segment")
              }, 100) // 少し遅らせることで安定させる
            }

            speechStartRef.current = null
            silenceTimerRef.current = null
          }, SILENCE_DURATION)
          console.log("VAD: Silence timer started")
        }
      }
      // それ以外（SILENCE_THRESHOLD <= rms <= SPEAKING_THRESHOLD）は何もしない

      // 次のフレームをリクエスト
      animationFrameIdRef.current = requestAnimationFrame(drawWaveform)
    }

    // 波形とVADの描画開始
    drawWaveform()

    // クリーンアップ関数でアニメーションとタイマーをキャンセル
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
  }, [isRecording]) // 依存関係を isRecording のみに

  // RMS（Root Mean Square）を計算する関数
  const calculateRMS = (data: Uint8Array): number => {
    let sumSquares = 0
    for (let i = 0; i < data.length; i++) {
      const normalized = data[i] / 128.0 - 1.0 // 正規化して-1.0〜1.0に
      sumSquares += normalized * normalized
    }
    const rms = Math.sqrt(sumSquares / data.length) * 100 // パーセンテージに変換
    return rms
  }

  return (
    <div className="flex flex-row items-center gap-4">
      {/* 録音コントロール */}
      <div className="flex items-center gap-4">
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

        {/* VADの状態表示（アイコン版） */}
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
          className="w-40 h-12 bg-gray-500 rounded-full shadow-inner"
        />
      </div>

      {/* 録音した音声の再生 */}
      {audioUrl && (
        <div>
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  )
}
