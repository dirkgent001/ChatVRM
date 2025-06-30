import { useState } from "react";
import Settings from "./settings";
import { getChatResponse, getOllamaResponse } from "@/features/chat";

export default function AppContainer({ Component, pageProps }: any) {
  const [modelProvider, setModelProvider] = useState<"openai" | "ollama">("ollama"); // default to ollama
  const [openAiKey, setOpenAiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false); // control visibility

  return (
    <>
      {/* Optional: Button to show settings manually */}
      <button
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 50,
          padding: "8px 12px",
        }}
        onClick={() => setShowSettings(!showSettings)}
      >
        ⚙️ Settings
      </button>

      {showSettings && (
        <Settings
          modelProvider={modelProvider}
          onChangeModelProvider={setModelProvider}
          openAiKey={openAiKey}
          onChangeOpenAiKey={setOpenAiKey}
        />
      )}

      <Component
        {...pageProps}
        modelProvider={modelProvider}
        openAiKey={openAiKey}
      />
    </>
  );
}
