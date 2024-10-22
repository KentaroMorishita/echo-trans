import React from "react"
import TextDisplay from "./TextDisplay"

type Props = {
  from: string
  to: string
  fromLabel: string
  toLabel: string
}

const TranslationPane: React.FC<Props> = ({ from, to, fromLabel, toLabel }) => {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/2 p-2 h-full flex flex-col">
        <h2 className="text-xl font-bold mb-2">{fromLabel}</h2>
        <TextDisplay text={from} />
      </div>
      <div className="w-1/2 p-2 h-full flex flex-col">
        <h2 className="text-xl font-bold mb-2">{toLabel}</h2>
        <TextDisplay text={to} />
      </div>
    </div>
  )
}

export default TranslationPane
