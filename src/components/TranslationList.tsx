import React from "react"
import { useRBox, set } from "f-box-react"
import { translationsBox } from "../box/translations"

import { pipe } from "fp-ts/lib/function"
import * as TaskEither from "fp-ts/lib/TaskEither"

import { FaClock, FaMicrophone, FaTrash, FaVolumeUp } from "react-icons/fa"
import { Match, When } from "./Match"
import { when } from "../services/match"
import { Map } from "./Map"
import { SortOrder } from "../types"
import { arrayRBoxHandlers } from "../services/arrayRBoxHandlers"
import { checkApiKey } from "../services/checkApiKey"
import { handleTranslation } from "../services/handleTranslation"
import { handleTextToSpeech } from "../services/handleTextToSpeech"

export type TranslationListProps = {
  sortOrder: SortOrder
}

export const TranslationList: React.FC<TranslationListProps> = ({
  sortOrder,
}) => {
  const [translations] = useRBox(translationsBox)
  const [editIndex, editIndexBox] = useRBox<number | null>(null)
  const [editValue, editValueBox] = useRBox<string>("")
  const setEditIndex = set(editIndexBox)
  const setEditValue = set(editValueBox)

  const sortedTranslations = translations.map((item, index) => ({
    item,
    index,
  }))

  if (sortOrder === "newest") {
    sortedTranslations.reverse()
  }

  const handlers = arrayRBoxHandlers(translationsBox)
  const update = handlers("update")
  const remove = handlers("remove")

  const handleEdit = (index: number, original: string) => {
    setEditIndex(index)
    setEditValue(original)
  }

  const handleEditFinish = () => {
    setEditIndex(null)
    setEditValue("")
  }

  const handleEditSubmit = () => {
    if (editIndex === null) return handleEditFinish()
    const original = translations[editIndex].original
    if (original === editValue) return handleEditFinish()

    const timestamp = translations[editIndex].timestamp

    pipe(
      TaskEither.right(editValue),
      TaskEither.flatMap(checkApiKey),
      TaskEither.flatMap(handleTranslation),
      TaskEither.match(
        (error) => console.error(error),
        (history) => {
          update(editIndex)({ ...history, timestamp })
          handleEditFinish()
        }
      )
    )()
  }

  const handleSpeech = (index: number, text: string) => {
    const history = translations[index]
    if (history.translatedAudioUrl) {
      console.log("Playing cached audio...", history.translatedAudioUrl)
      return new Audio(history.translatedAudioUrl).play()
    }

    pipe(
      TaskEither.right(text),
      TaskEither.flatMap(checkApiKey),
      TaskEither.flatMap(handleTextToSpeech),
      TaskEither.match(
        (error) => console.error(error),
        (translatedAudioUrl) => {
          update(index)({ ...history, translatedAudioUrl })
        }
      )
    )()
  }

  return (
    <Match>
      <When exp={translations.length > 0}>
        <Map items={sortedTranslations}>
          {({ item, index }) => (
            <div className="flex flex-col gap-2 mb-4 p-3 bg-gray-100 rounded-lg shadow-sm">
              <div className="flex items-center text-lg text-gray-600">
                <FaMicrophone className="mr-2" />
                <Match>
                  <When exp={editIndex === index}>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleEditSubmit()}
                      onKeyDown={(e) =>
                        when([
                          e.key === "Enter" && e.shiftKey,
                          () => {
                            e.preventDefault(), handleEditSubmit()
                          },
                        ])
                      }
                      className="w-full bg-gray-100 border-b border-gray-400 focus:outline-none focus:border-blue-600 resize-none"
                      rows={editValue.split("\n").length || 1}
                      autoFocus
                    />
                  </When>
                  <When otherwise>
                    <span
                      onDoubleClick={() => handleEdit(index, item.original)}
                    >
                      {item.original}
                    </span>
                  </When>
                </Match>
              </div>
              <div className="flex items-center text-2xl text-blue-600">
                <button
                  onClick={() => handleSpeech(index, item.translated)}
                  className="text-xl"
                >
                  <FaVolumeUp className="mr-2" />
                </button>
                <span>{item.translated}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <FaClock className="mr-2" />
                  <span>{item.timestamp.toISOString()}</span>
                </div>
                <button
                  onClick={() => remove(index)()}
                  className="text-sm text-red-500 hover:underline"
                >
                  <FaTrash className="mr-2" />
                </button>
              </div>
            </div>
          )}
        </Map>
      </When>
      <When otherwise>
        <p className="text-sm text-gray-500">No translations yet.</p>
      </When>
    </Match>
  )
}
