import React from "react"

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
}

const LanguageSelector: React.FC<Props> = ({ label, value, onChange }) => {
  return (
    <>
      <div>
        <label className="block font-semibold mb-2">{label}:</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
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

export default LanguageSelector