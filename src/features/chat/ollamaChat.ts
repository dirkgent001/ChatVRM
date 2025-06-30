import { Message } from "@/features/messages/messages";

export async function getOllamaResponse(messages: Message[]) {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "phi4:14b-q4_K_M", // 🔁 Replace with your model name if needed
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama response error: ${response.statusText}`);
  }

  const data = await response.json();

  return data.message?.content || "⚠️ No response from Ollama.";
}
