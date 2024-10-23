import React, { useState, useRef, useEffect } from "react"
import { FaMicrophone, FaStop } from "react-icons/fa"

type Props = {
  onAudioData: (data: Blob) => void
}

const AudioRecorder: React.FC<Props> = ({ onAudioData }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)

  // デバイス一覧の取得
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput"
      )
      setDevices(audioDevices)

      if (audioDevices.length > 0) {
        setSelectedDeviceId(audioDevices[0].deviceId)
      }
    })
  }, [])

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
          autoGainControl: true,
          echoCancellation: false,
          noiseSuppression: false,
        },
      })
      console.log("Audio stream obtained:", stream)

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0 // スムージング無効化

      console.log("Connecting source to analyser...")
      source.connect(analyser)
      analyserRef.current = analyser
      console.log("MediaStreamAudioSourceNode connected:", source)

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          // デバッグ用: 音声データのログ出力
          // console.log("Audio chunk received:", event.data)
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
      console.log("MediaRecorder started with 50ms timeslice")
    } catch (err) {
      console.error("録音開始エラー:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      audioContextRef.current?.close()
      console.log("Recording stopped manually")
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
        animationFrameIdRef.current = null
      }
    }
  }

  // 波形の描画
  useEffect(() => {
    if (!isRecording) {
      // 録音が停止したら描画を停止
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

    console.log("Start visualizing waveform...")

    const drawWaveform = () => {
      analyser.getByteTimeDomainData(dataArray)

      // デバッグ用: 波形データのログ出力
      // console.log("Time domain data during draw:", dataArray)

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
      canvasCtx.fillStyle = "rgb(75, 85, 99)"
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

      // 波形の描画
      canvasCtx.lineWidth = 0.5
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

      // 次のフレームをリクエスト
      animationFrameIdRef.current = requestAnimationFrame(drawWaveform)
    }

    // 描画開始
    drawWaveform()

    // クリーンアップ関数でアニメーションをキャンセル
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [isRecording])

  return (
    <div className="flex flex-wrap items-end space-y-4 gap-4">
      {/* デバイス選択ドロップダウン */}
      <div>
        <label className="block font-semibold mb-2">Select Audio Device:</label>
        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="p-2 border rounded-md"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Audio Device ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

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
      </div>

      {/* 波形描画用のキャンバス */}
      <canvas
        ref={canvasRef}
        className="w-40 h-12 bg-gray-600 rounded-full shadow-inner"
      />

      {/* 録音した音声の再生 */}
      {audioUrl && (
        <div>
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  )
}

export default AudioRecorder
