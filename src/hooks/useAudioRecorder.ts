import { useRef, useEffect, useCallback } from "react"
import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"
import { useVAD, VADState } from "./useVAD"

export const useAudioRecorder = (onAudioData: (data: Blob) => void) => {
  const [config] = useRBox(configBox)
  const [isRecording, isRecordingBox] = useRBox(false)
  const [audioUrl, audioUrlBox] = useRBox<string | null>(null)
  const [isSpeaking, isSpeakingBox] = useRBox(false)
  const [currentAudioLevel, currentAudioLevelBox] = useRBox(-Infinity)
  const [vadState, vadStateBox] = useRBox<VADState>('silent')
  const [isStreamActive, isStreamActiveBox] = useRBox(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isManualStopRef = useRef<boolean>(false)

  // setter
  const setIsRecording = set(isRecordingBox)
  const setAudioUrl = set(audioUrlBox)
  const setIsSpeaking = set(isSpeakingBox)
  const setCurrentAudioLevel = set(currentAudioLevelBox)
  const setVadState = set(vadStateBox)
  const setIsStreamActive = set(isStreamActiveBox)

  // 録音開始関数
  const startRecording = useCallback(async () => {
    try {
      // 手動停止フラグをリセット
      isManualStopRef.current = false
      // VAD無効の場合は新しくストリームを作成、VAD有効の場合は既存のストリームを使用
      if (!config.enableVAD || !streamRef.current) {
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
        
        setIsStreamActive(true)
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
  }, [config.enableVAD, setIsRecording, setAudioUrl, onAudioData])

  // 録音停止関数
  const stopRecording = useCallback((isManual: boolean = false) => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // 手動停止の場合はフラグを設定
      if (isManual) {
        isManualStopRef.current = true
      }

      // VAD無効の場合、または手動停止の場合はストリームを完全に停止
      if (!config.enableVAD || isManual) {
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
        setIsStreamActive(false)
      }
      // VAD有効の場合は、ストリームは維持してVAD用に使い続ける
    }
  }, [config.enableVAD, setIsRecording])

  // VADコールバック
  const handleSpeechStart = useCallback(() => {
    console.log("VAD: Speech started")
    setIsSpeaking(true)
    // 録音開始はStartボタンのみ - ここでは何もしない
  }, [setIsSpeaking])

  const handleSpeechEnd = useCallback(() => {
    console.log("VAD: Speech ended")
    setIsSpeaking(false)

    // VAD有効時で録音中なら自動でstop→start（翻訳→次の録音待機）
    if (config.enableVAD && isRecording && !isManualStopRef.current) {
      console.log("VAD: Stopping recording and preparing for next segment")
      stopRecording(false) // VADによる自動停止
      
      // 少し遅延してから次の録音を開始（翻訳処理の時間を考慮）
      setTimeout(() => {
        // 手動停止されていない場合のみ次の録音を開始
        if (!isManualStopRef.current) {
          console.log("VAD: Starting next recording segment")
          startRecording()
        }
      }, 100)
    }
  }, [config.enableVAD, isRecording, setIsSpeaking, stopRecording, startRecording])

  const handleVolumeUpdate = useCallback((volume: number) => {
    setCurrentAudioLevel(volume)
  }, [setCurrentAudioLevel])

  const handleStateChange = useCallback((state: VADState) => {
    setVadState(state)
  }, [setVadState])

  // 新しいVADフックを使用
  useVAD(
    analyserRef,
    config.vadSettings,
    {
      onSpeechStart: handleSpeechStart,
      onSpeechEnd: handleSpeechEnd,
      onVolumeUpdate: handleVolumeUpdate,
      onStateChange: handleStateChange,
    },
    config.enableVAD && isStreamActive
  )

  // VAD用のオーディオストリーム初期化
  const initializeAudioStream = useCallback(async () => {
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
      
      setIsStreamActive(true)
    } catch (err) {
      console.error("オーディオストリーム初期化エラー:", err)
    }
  }, [setIsStreamActive])

  // VAD有効時のオーディオストリーム管理
  useEffect(() => {
    if (config.enableVAD) {
      initializeAudioStream()
    } else {
      // VAD無効時にストリームを停止
      if (streamRef.current && !isRecording) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        analyserRef.current = null
        gainNodeRef.current = null
        setIsStreamActive(false)
      }
    }
  }, [config.enableVAD, isRecording, initializeAudioStream, setIsStreamActive])

  return {
    isRecording,
    isRecordingBox,
    audioUrl,
    audioUrlBox,
    isSpeaking,
    isSpeakingBox,
    currentAudioLevel,
    currentAudioLevelBox,
    vadState,
    vadStateBox,
    analyserRef,
    startRecording,
    stopRecording,
    setIsRecording,
    setAudioUrl,
    setIsSpeaking,
    setCurrentAudioLevel,
    setVadState,
    isStreamActive,
    isStreamActiveBox,
    setIsStreamActive,
  }
}