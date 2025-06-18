import { useRef, useCallback, useEffect } from 'react'

export type VADSettings = {
  startThreshold: number    // 発話開始しきい値 (dB: -60 to 0)
  stopThreshold: number     // 発話停止しきい値 (dB: -60 to 0)
  minSpeechDuration: number // 最小発話時間 (ms)
  minSilenceDuration: number // 最小沈黙時間 (ms)
  smoothingFactor: number   // 平滑化係数 (0-1)
}

export type VADState = 'silent' | 'speaking' | 'pending_speech' | 'pending_silence'

export type VADCallbacks = {
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
  onVolumeUpdate?: (volume: number) => void
  onStateChange?: (state: VADState) => void
}

export const DEFAULT_VAD_SETTINGS: VADSettings = {
  startThreshold: -35,      // -35 dB で発話開始
  stopThreshold: -45,       // -45 dB で発話停止
  minSpeechDuration: 300,   // 最低300ms発話
  minSilenceDuration: 500,  // 最低500ms沈黙
  smoothingFactor: 0.7,     // 平滑化係数
}

export const useVAD = (
  analyserRef: React.RefObject<AnalyserNode | null>,
  settings: VADSettings = DEFAULT_VAD_SETTINGS,
  callbacks: VADCallbacks = {},
  enabled: boolean = true
) => {
  const stateRef = useRef<VADState>('silent')
  const volumeRef = useRef<number>(-Infinity)
  const smoothedVolumeRef = useRef<number>(-Infinity)
  const animationFrameRef = useRef<number | null>(null)
  const speechStartTimeRef = useRef<number | null>(null)
  const silenceStartTimeRef = useRef<number | null>(null)
  const callbacksRef = useRef(callbacks)
  
  // コールバックを常に最新の状態に保つ
  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  // デシベル計算（周波数ドメイン解析）
  const calculateVolumeDB = useCallback((frequencyData: Uint8Array): number => {
    let sum = 0
    
    // 周波数データの二乗平均平方根（RMS）を計算
    for (let i = 0; i < frequencyData.length; i++) {
      // frequencyDataは0-255の範囲
      const normalized = frequencyData[i] / 255.0
      sum += normalized * normalized
    }
    
    const rms = Math.sqrt(sum / frequencyData.length)
    
    // 無音の場合
    if (rms === 0) return -Infinity
    
    // RMSをデシベルに変換（参照値は1.0）
    const volumeDB = 20 * Math.log10(rms)
    
    // 実用的な範囲に制限 (-100dB to 0dB)
    return Math.max(-100, Math.min(0, volumeDB))
  }, [])

  // VAD状態更新
  const updateVADState = useCallback((volume: number, timestamp: number) => {
    const currentState = stateRef.current
    
    switch (currentState) {
      case 'silent':
        if (volume > settings.startThreshold) {
          stateRef.current = 'pending_speech'
          speechStartTimeRef.current = timestamp
          callbacksRef.current.onStateChange?.('pending_speech')
        }
        break
        
      case 'pending_speech':
        if (volume > settings.startThreshold) {
          const speechDuration = timestamp - (speechStartTimeRef.current || timestamp)
          if (speechDuration >= settings.minSpeechDuration) {
            stateRef.current = 'speaking'
            callbacksRef.current.onStateChange?.(stateRef.current)
            callbacksRef.current.onSpeechStart?.()
          }
        } else {
          // しきい値を下回ったので沈黙に戻る
          stateRef.current = 'silent'
          speechStartTimeRef.current = null
          callbacksRef.current.onStateChange?.(stateRef.current)
        }
        break
        
      case 'speaking':
        if (volume <= settings.stopThreshold) {
          stateRef.current = 'pending_silence'
          silenceStartTimeRef.current = timestamp
          callbacksRef.current.onStateChange?.('pending_silence')
        }
        break
        
      case 'pending_silence':
        if (volume > settings.stopThreshold) {
          // 再び音声が検出されたので発話状態に戻る
          stateRef.current = 'speaking'
          silenceStartTimeRef.current = null
          callbacksRef.current.onStateChange?.(stateRef.current)
        } else {
          const silenceDuration = timestamp - (silenceStartTimeRef.current || timestamp)
          if (silenceDuration >= settings.minSilenceDuration) {
            stateRef.current = 'silent'
            silenceStartTimeRef.current = null
            callbacksRef.current.onStateChange?.(stateRef.current)
            callbacksRef.current.onSpeechEnd?.()
          }
        }
        break
    }
  }, [settings])

  // メインのVAD処理ループ
  const processVAD = useCallback(() => {
    if (!enabled || !analyserRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const frequencyData = new Uint8Array(bufferLength)
    
    const processFrame = () => {
      if (!enabled || !analyser) return
      
      // 周波数データを取得
      analyser.getByteFrequencyData(frequencyData)
      
      // 音量をdBで計算
      const currentVolume = calculateVolumeDB(frequencyData)
      volumeRef.current = currentVolume
      
      // 平滑化
      if (smoothedVolumeRef.current === -Infinity) {
        smoothedVolumeRef.current = currentVolume
      } else {
        smoothedVolumeRef.current = 
          smoothedVolumeRef.current * settings.smoothingFactor + 
          currentVolume * (1 - settings.smoothingFactor)
      }
      
      // VAD状態更新
      updateVADState(smoothedVolumeRef.current, Date.now())
      
      // コールバック呼び出し
      callbacksRef.current.onVolumeUpdate?.(smoothedVolumeRef.current)
      
      // 次のフレーム処理をスケジュール
      animationFrameRef.current = requestAnimationFrame(processFrame)
    }
    
    processFrame()
  }, [enabled, analyserRef, calculateVolumeDB, updateVADState, settings])

  // VAD処理の開始/停止
  useEffect(() => {
    if (enabled) {
      processVAD()
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      // 状態をリセット
      stateRef.current = 'silent'
      volumeRef.current = -Infinity
      smoothedVolumeRef.current = -Infinity
      speechStartTimeRef.current = null
      silenceStartTimeRef.current = null
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [enabled, processVAD])

  // 現在の状態と音量を返す
  const getCurrentState = useCallback((): VADState => stateRef.current, [])
  const getCurrentVolume = useCallback((): number => volumeRef.current, [])
  const getSmoothedVolume = useCallback((): number => smoothedVolumeRef.current, [])

  return {
    getCurrentState,
    getCurrentVolume,
    getSmoothedVolume,
  }
}