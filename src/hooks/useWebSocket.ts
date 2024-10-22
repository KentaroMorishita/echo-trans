import { useEffect, useRef, useState } from "react"

const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<string[]>([])
  const socketRef = useRef<WebSocket | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWebSocket = () => {
    console.log("Attempting to connect to WebSocket...")

    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log("WebSocket connection opened")
      setIsConnecting(false)
      socketRef.current = ws
    }

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data])
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket connection closed")

      if (!isConnecting) {
        setIsConnecting(true)
        // 2秒後に再接続を試みる
        setTimeout(() => {
          console.log("Retrying WebSocket connection...")
          connectWebSocket()
        }, 2000)
      }
    }
  }

  useEffect(() => {
    connectWebSocket()

    return () => {
      console.log("WebSocket cleanup")
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, []) // 依存配列を空にして、初回レンダリング時のみ実行

  // WebSocket経由でメッセージを送信
  const sendMessage = (message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message)
    } else {
      console.warn("Cannot send message: WebSocket is not open")
    }
  }

  return { messages, sendMessage }
}

export default useWebSocket
