import React from "react"

export const VADSelector: React.FC<{
  enableVAD: boolean
  setEnableVAD: (enableVAD: boolean) => void
}> = ({ enableVAD, setEnableVAD }) => {
  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">
        Use VAD (Voice Activity Detection):
      </label>
      <select
        value={String(enableVAD)}
        onChange={(e) => {
          const value = e.target.value === "true"
          localStorage.setItem("enableVAD", String(value))
          setEnableVAD(value)
        }}
        className="p-2 border rounded-md w-full"
      >
        <option value={String(true)}>Enabled</option>
        <option value={String(false)}>Disabled</option>
      </select>
    </div>
  )
}
