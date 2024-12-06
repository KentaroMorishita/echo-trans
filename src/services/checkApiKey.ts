import { Task, Either } from "f-box-core"
import { handleError } from "./handleError"
import { configBox } from "../box/config"

export const checkApiKey = <T>(data: T) =>
  Task.tryCatch<Either<Error, T>>(() => {
    const { apiKey } = configBox.getValue()
    if (!apiKey) {
      throw "API Key is required"
    }

    return Either.right(data)
  }, handleError)
