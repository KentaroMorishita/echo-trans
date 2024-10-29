import React from "react"
import { Language } from "../types"

export type LanguageSelectorProps = {
  label: string
  value: string
  onChange: (value: Language) => void
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <>
      <div>
        <label className="block font-semibold mb-2">{label}:</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as Language)}
          className="p-2 border rounded-md"
        >
          <option value="ja">日本語</option>
          <option value="en">英語</option>
          <option value="vi">ベトナム語</option>
        </select>
      </div>
    </>
  )
}
