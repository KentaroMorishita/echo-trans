import React from "react"
import { FaClock, FaMicrophone, FaLanguage } from "react-icons/fa"
import { Match, When } from "./Match"
import { TranslationHistory, SortOrder } from "../types"

export type TranslationListProps = {
  translations: TranslationHistory[]
  sortOrder: SortOrder
}

export const TranslationList: React.FC<TranslationListProps> = ({
  translations,
  sortOrder,
}) => {
  const sortedTranslations = [...translations]
  if (sortOrder === "newest") {
    sortedTranslations.reverse()
  }

  return (
    <Match>
      <When exp={translations.length > 0}>
        {sortedTranslations.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 mb-4 p-3 bg-gray-100 rounded-lg shadow-sm"
          >
            <div className="flex items-center text-lg text-gray-600">
              <FaMicrophone className="mr-2" />
              <span>{item.original}</span>
            </div>
            <div className="flex items-center text-2xl text-blue-600">
              <FaLanguage className="mr-2" />
              <span>{item.translated}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <FaClock className="mr-2" />
              <span>{item.timestamp.toISOString()}</span>
            </div>
          </div>
        ))}
      </When>
      <When otherwise>
        <p className="text-sm text-gray-500">No translations yet.</p>
      </When>
    </Match>
  )
}
