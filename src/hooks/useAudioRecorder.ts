import { useRef, useEffect } from "react"
import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"

export const useAudioRecorder = (onAudioData: (data: Blob) => void) => {
  const [config] = useRBox(configBox)
  const [isRecording, isRecordingBox] = useRBox(false)
  const [audioUrl, audioUrlBox] = useRBox<string | null>(null)
  const [isSpeaking, isSpeakingBox] = useRBox(false)
  const [currentAudioLevel, currentAudioLevelBox] = useRBox(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // setter
  const setIsRecording = set(isRecordingBox)
  const setAudioUrl = set(audioUrlBox)
  const setIsSpeaking = set(isSpeakingBox)
  const setCurrentAudioLevel = set(currentAudioLevelBox)

  // オートモード用のオーディオストリーム初期化
  const initializeAudioStream = async () => {
    if (streamRef.current) return // 既に初期化済み

    try {
      const { selectedDeviceId } = configBox.getValue()
      
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

      streamRef.current = stream

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0
      analyserRef.current = analyser

      const gainNode = audioContext.createGain()
      gainNode.gain.value = 2.0
      gainNodeRef.current = gainNode

      source.connect(gainNode)
      gainNode.connect(analyser)
    } catch (err) {
      console.error("オーディオストリーム初期化エラー:", err)
    }
  }

  // オートモードでのオーディオストリーム管理
  useEffect(() => {
    if (config.recordingMode === "auto") {
      initializeAudioStream()
    } else {
      // マニュアルモードに切り替わったらストリームを停止
      if (streamRef.current && !isRecording) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        analyserRef.current = null
        gainNodeRef.current = null
      }
    }
  }, [config.recordingMode, isRecording])

  const startRecording = async () => {
    try {
      // オートモードの場合は既存のストリームを使用、マニュアルモードの場合は新しくストリームを作成
      if (config.recordingMode === "manual" || !streamRef.current) {
        const { selectedDeviceId } = configBox.getValue()

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

        streamRef.current = stream

        const audioContext = new AudioContext()
        audioContextRef.current = audioContext

        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 2048
        analyser.smoothingTimeConstant = 0
        analyserRef.current = analyser

        const gainNode = audioContext.createGain()
        gainNode.gain.value = 2.0
        gainNodeRef.current = gainNode

        source.connect(gainNode)
        gainNode.connect(analyser)
      }

      if (!streamRef.current) {
        throw new Error("オーディオストリームの取得に失敗しました")
      }

      // WAV形式をサポートしているかチェック
      let mimeType = "audio/wav"
      if (!MediaRecorder.isTypeSupported("audio/wav")) {
        // WAVがサポートされていない場合はWebMを使用
        mimeType = "audio/webm"
      }
      
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType,
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        // 使用したmimeTypeでBlobを作成
        const usedMimeType = mediaRecorder.mimeType || mimeType
        const audioBlob = new Blob(audioChunksRef.current, {
          type: usedMimeType,
        })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onAudioData(audioBlob)
      }

      mediaRecorder.start(50)
      setIsRecording(true)
    } catch (err) {
      console.error("録音開始エラー:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // マニュアルモードの場合のみストリームを完全に停止
      if (config.recordingMode === "manual") {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }

        analyserRef.current = null
        gainNodeRef.current = null
      }
      // オートモードの場合は、ストリームは維持してVAD用に使い続ける
    }
  }

  return {
    isRecording,
    isRecordingBox,
    audioUrl,
    audioUrlBox,
    isSpeaking,
    isSpeakingBox,
    currentAudioLevel,
    currentAudioLevelBox,
    analyserRef,
    startRecording,
    stopRecording,
    setIsRecording,
    setAudioUrl,
    setIsSpeaking,
    setCurrentAudioLevel,
  }
}
