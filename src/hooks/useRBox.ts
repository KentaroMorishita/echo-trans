import { useRef } from "react"
import { useSyncExternalStore } from "react"
import { rbox, RBox } from "../lib/rbox"

export const useRBox = <T>(initialValueOrBox: T | RBox<T>): [T, RBox<T>] => {
  const box = useRef<RBox<T>>(
    initialValueOrBox instanceof Object && (initialValueOrBox as RBox<T>).isRBox
      ? (initialValueOrBox as RBox<T>)
      : rbox(initialValueOrBox as T)
  ).current

  // React の再レンダリングと統合
  const value = useSyncExternalStore(
    (onStoreChange) => {
      const key = box.subscribe(onStoreChange)
      return () => box.unsubscribe(key)
    },
    () => box.getValue()
  )

  return [value, box]
}
