import React from "react"

export type WhenType = {
  exp?: boolean
  otherwise?: boolean
  children: React.ReactNode
}

export type MatchProps = {
  children: React.ReactElement<WhenType> | React.ReactElement<WhenType>[]
}

export const Match: React.FC<MatchProps> = ({ children }) => {
  const childrenArray = React.Children.toArray(children)
  const matchedChild = childrenArray.find((child) => {
    if (React.isValidElement<WhenType>(child)) {
      const { exp, otherwise } = child.props
      return exp || otherwise
    }
    return false
  })

  return matchedChild ? <>{matchedChild}</> : <></>
}

export const When: React.FC<WhenType> = ({
  children,
  exp = false,
  otherwise = false,
}) => (exp || otherwise) && <>{children}</>
