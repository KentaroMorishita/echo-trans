import { Either } from "f-box-core"

export const handleError = (reason: unknown) =>
  Either.left(reason instanceof Error ? reason : new Error(String(reason)))
