import { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { tryCatch } from "fp-ts/lib/TaskEither"
import { Config } from "../types"
import { handleError } from "./handleError"

export const checkApiKey: <T>(data: T) => ReaderTaskEither<Config, Error, T> =
  (data) =>
  ({ apiKey }) =>
    tryCatch(async () => {
      if (!apiKey) {
        alert("Please enter the API Key")
        throw "API Key is required"
      }

      return data
    }, handleError)
