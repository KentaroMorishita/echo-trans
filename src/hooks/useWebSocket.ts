import { useEffect, useState } from "react"

const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data])
    }

    return () => ws.close()
  }, [url])

  return messages
}

export default useWebSocket
