// src/features/chat/ollamaChat.ts

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function getOllamaResponse(messages: Message[]) {
  try {
    if (!Array.isArray(messages)) {
      console.error("Expected an array of messages but got:", messages);
      throw new Error("Invalid messages format sent to Ollama.");
    }

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "phi4:14b-q4_K_M",
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: false  // <-- Make sure streaming is explicitly off
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const text = await response.text();
    const lines = text.split("\n").filter(line => line.trim() !== "");

    let finalMessage = "";

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        console.log("[Ollama Chunk]", parsed);
        if (parsed.message?.content) {
          finalMessage += parsed.message.content;
        }
      } catch (err) {
        console.warn("Skipping invalid JSON line from Ollama:", line);
      }
    }

    if (finalMessage) {
      return finalMessage;
    }

    console.warn("No valid message content received from Ollama.");
    return "[No response content from Ollama]";
  } catch (error) {
    console.error("Error in getOllamaResponse:", error);
    return "Error communicating with Ollama.";
  }
}
