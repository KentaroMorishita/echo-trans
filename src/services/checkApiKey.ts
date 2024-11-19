import * as TaskEither from "fp-ts/lib/TaskEither"
import { handleError } from "./handleError"
import { configBox } from "../box/config"

export const checkApiKey: <T>(data: T) => TaskEither.TaskEither<Error, T> = (
  data
) =>
  TaskEither.tryCatch(async () => {
    const { apiKey } = configBox.getValue()
    if (!apiKey) {
      alert("Please enter the API Key")
      throw "API Key is required"
    }

    return data
  }, handleError)
