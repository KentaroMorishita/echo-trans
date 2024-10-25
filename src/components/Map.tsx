import React from "react"

export const Map = <T,>({
  items,
  children,
}: {
  items: T[]
  children: (item: T, index: number) => React.ReactNode
}): React.ReactElement => (
  <>
    {items.map((item, index) => (
      <React.Fragment key={index}>{children(item, index)}</React.Fragment>
    ))}
  </>
)
