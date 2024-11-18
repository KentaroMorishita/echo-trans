import { RBox } from "../lib/rbox"
import { match } from "./match"

export type Operation = "update" | "insert" | "remove"
export type UpdateFunction<T> = (prev: T[], index: number, value: T) => T[]
export type InsertFunction<T> = (prev: T[], index: number, value: T) => T[]
export type RemoveFunction<T> = (prev: T[], index: number) => T[]
export type OperationFunction<T> =
  | UpdateFunction<T>
  | InsertFunction<T>
  | RemoveFunction<T>

export type HandleMethods<T> = Record<Operation, OperationFunction<T>>

export const handleUpdate =
  <T>(): UpdateFunction<T> =>
  (prev, index, value) =>
    prev.flatMap((item, i) => (i === index ? [value] : [item]))

export const handleInsert =
  <T>(): InsertFunction<T> =>
  (prev, index, value) =>
    match([
      [prev.length === 0, () => [value]],
      [prev.length < index, () => [...prev, value]],
      [index <= 0, () => [value, ...prev]],
    ])(() => prev.flatMap((item, i) => (i === index ? [value, item] : [item])))

export const handleRemove =
  <T>(): RemoveFunction<T> =>
  (prev, index) =>
    prev.flatMap((item, i) => (i === index ? [] : [item]))

export const handleMethods = <T>(): HandleMethods<T> => ({
  update: handleUpdate(),
  insert: handleInsert(),
  remove: handleRemove(),
})

export const arrayRBoxHandlers =
  <T>(rbox: RBox<T[]>) =>
  (operation: Operation) =>
  (index: number) =>
  (value?: T) =>
    rbox.setValue((prev) =>
      match<T[]>(
        (["update", "insert", "remove"] as Operation[]).map((op) => [
          op === operation,
          () => handleMethods<T>()[op](prev, index, value!),
        ])
      )(() => prev)
    )
