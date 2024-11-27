import { useRef } from "react"
import { useRBox, set } from "f-box-react"
import { configBox } from "../box/config"

export const useAudioRecorder = (onAudioData: (data: Blob) => void) => {
  const [isRecording, isRecordingBox] = useRBox(false)
  const [audioUrl, audioUrlBox] = useRBox<string | null>(null)
  const [isSpeaking, isSpeakingBox] = useRBox(false)

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

  const startRecording = async () => {
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
  }

  return {
    isRecording,
    isRecordingBox,
    audioUrl,
    audioUrlBox,
    isSpeaking,
    isSpeakingBox,
    analyserRef,
    startRecording,
    stopRecording,
    setIsRecording,
    setAudioUrl,
    setIsSpeaking,
  }
}
