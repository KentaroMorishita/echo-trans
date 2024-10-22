import React from "react"

type Props = {
  text: string
}

const TextDisplay: React.FC<Props> = ({ text }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md flex-grow overflow-y-auto">
      <p>{text}</p>
    </div>
  )
}

export default TextDisplay
