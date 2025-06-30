import { Configuration, OpenAIApi } from "openai";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const apiKey = req.body.apiKey || process.env.OPEN_AI_KEY;
  const messages = req.body.messages;
  const provider = req.body.provider || "openai"; // "openai" or "ollama"
  const model = req.body.model || "gpt-3.5-turbo";

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: "Invalid messages format." });
  }

  if (provider === "ollama") {
    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model || "llama3",
          messages: messages.map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const result = await response.json();
      const message = result.message?.content || "No response from Ollama.";
      return res.status(200).json({ message });
    } catch (err) {
      console.error("[Ollama Error]", err);
      return res
        .status(500)
        .json({ message: "An error occurred while querying Ollama." });
    }
  }

  // Default to OpenAI
  if (!apiKey) {
    return res
      .status(400)
      .json({ message: "API key is missing or invalid." });
  }

  try {
    const configuration = new Configuration({ apiKey });
    delete configuration.baseOptions.headers["User-Agent"];
    const openai = new OpenAIApi(configuration);

    const { data } = await openai.createChatCompletion({
      model,
      messages,
    });

    const [aiRes] = data.choices;
    const message = aiRes.message?.content || "No response from OpenAI.";
    return res.status(200).json({ message });
  } catch (err) {
    console.error("[OpenAI Error]", err);
    return res
      .status(500)
      .json({ message: "An error occurred while querying OpenAI." });
  }
}
