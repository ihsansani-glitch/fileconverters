import { toolBrain } from "./toolBrain"

export function getToolResponse(message) {
  const msg = message.toLowerCase()

  const match = toolBrain.find(tool =>
    tool.keywords.some(k => msg.includes(k))
  )

  if (match) {
    return {
      type: "tool",
      text: `I found: ${match.label}`,
      route: match.route
    }
  }

  return {
    type: "chat",
    text: "Try asking: compress pdf, remove background, convert video"
  }
}