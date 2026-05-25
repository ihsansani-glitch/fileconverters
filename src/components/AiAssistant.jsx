import { useState } from "react"
import { useNavigate } from "react-router-dom"

function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const navigate = useNavigate()

  function getResponse(text) {
    const msg = text.toLowerCase()

    if (msg.includes("pdf")) {
      return { type: "tool", text: "Opening PDF Tools...", route: "/pdf-tools" }
    }

    if (msg.includes("image")) {
      return { type: "tool", text: "Opening Image Tools...", route: "/image-tools" }
    }

    if (msg.includes("video")) {
      return { type: "tool", text: "Opening Video Tools...", route: "/video-tools" }
    }

    return {
      type: "bot",
      text: "Try: pdf tools, image tools, video tools"
    }
  }

  function sendMessage() {
    if (!input.trim()) return

    const userMsg = { role: "user", text: input }
    const res = getResponse(input)

    setMessages(prev => [...prev, userMsg, res])
    setInput("")

    if (res.type === "tool") {
      setTimeout(() => {
        navigate(res.route)
        setOpen(false)
      }, 700)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl text-xl z-50"
      >
        💬
      </button>

      {/* Chat Window (WHITE THEME) */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[420px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">

          {/* HEADER */}
          <div className="bg-blue-600 text-white p-3 font-semibold">
            AI Assistant
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm bg-gray-50">

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[75%] ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-black border border-gray-200"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

          </div>

          {/* INPUT AREA */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex border-t border-gray-200 bg-white"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 p-3 bg-white text-black outline-none resize-none h-12"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-4"
            >
              Send
            </button>
          </form>

        </div>
      )}
    </>
  )
}

export default AiAssistant