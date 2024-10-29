import { Dispatch, useCallback, SetStateAction } from "react"

export const objectStateUpdater = <T>(setState: Dispatch<SetStateAction<T>>) =>
  useCallback(
    <K extends keyof T>(key: K) =>
      (value: T[K]) => {
        setState((prevState) => ({
          ...prevState,
          [key]: value,
        }))
      },
    [setState]
  )
