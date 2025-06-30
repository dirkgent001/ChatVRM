import { useCallback, useContext, useEffect, useState } from "react";
import VrmViewer from "@/components/vrmViewer";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import {
  Message,
  textsToScreenplay,
  Screenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import { KoeiroParam, DEFAULT_PARAM } from "@/features/constants/koeiroParam";
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { getOllamaResponse } from "@/features/chat/ollamaChat";
import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { GitHubLink } from "@/components/githubLink";
import { Meta } from "@/components/meta";

export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAiKey, setOpenAiKey] = useState("");
  const [koeiromapKey, setKoeiromapKey] = useState("");
  const [modelProvider, setModelProvider] = useState<"openai" | "ollama">("openai");
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      setSystemPrompt(params.systemPrompt ?? SYSTEM_PROMPT);
      setKoeiroParam(params.koeiroParam ?? DEFAULT_PARAM);
      setChatLog(params.chatLog ?? []);
    }
  }, []);

  useEffect(() => {
    process.nextTick(() =>
      window.localStorage.setItem(
        "chatVRMParams",
        JSON.stringify({ systemPrompt, koeiroParam, chatLog })
      )
    );
  }, [systemPrompt, koeiroParam, chatLog]);

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((v: Message, i) => {
        return i === targetIndex ? { role: v.role, content: text } : v;
      });
      setChatLog(newChatLog);
    },
    [chatLog]
  );

  // Handles sequential TTS playback using screenplays
  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      speakCharacter(screenplay, viewer, koeiromapKey, onStart, onEnd);
    },
    [viewer, koeiromapKey]
  );

  // Handles sending the user message and retrieving AI response
  const handleSendChat = useCallback(
    async (text: string) => {
      if (modelProvider === "openai" && !openAiKey) {
        setAssistantMessage("No OpenAI API key provided.");
        return;
      }

      if (!text) return;
      setChatProcessing(true);

      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: text },
      ];
      setChatLog(messageLog);

      if (modelProvider === "ollama") {
        try {
          const response = await getOllamaResponse([
            { role: "user", content: text }
          ]);

          const assistantText = await getOllamaResponse(messageLog);
          setAssistantMessage(assistantText);
          setChatLog([
            ...messageLog,
            { role: "assistant", content: assistantText },
          ]);

        } catch (error) {
          console.error(error);
          setAssistantMessage("Error communicating with Ollama.");
        } finally {
          setChatProcessing(false);
        }
        return;
      }

      // Handle OpenAI streaming response
      const messages: Message[] = [
        { role: "system", content: systemPrompt },
        ...messageLog,
      ];

      const stream = await getChatResponseStream(messages, openAiKey).catch((e) => {
        console.error(e);
        return null;
      });

      if (stream == null) {
        setChatProcessing(false);
        return;
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullMessage = "";
      let received = "";
      let tag = "";
      const sentences: string[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          received += chunk;

          const tagMatch = received.match(/^\[(.*?)\]/);
          if (tagMatch && tagMatch[0]) {
            tag = tagMatch[0];
            received = received.slice(tag.length);
          }

          const sentenceMatch = received.match(/^(.+[。．！？\n]|.{10,}[、,])/);
          if (sentenceMatch && sentenceMatch[0]) {
            const sentence = sentenceMatch[0];
            sentences.push(sentence);
            received = received.slice(sentence.length).trimStart();

            if (!sentence.replace(/^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g, "")) {
              continue;
            }

            const aiText = `${tag} ${sentence}`;
            const aiTalks = textsToScreenplay([aiText], koeiroParam);
            const currentMessage = sentences.join(" ");

            handleSpeakAi(aiTalks[0], () => {
              setAssistantMessage(currentMessage);
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        reader.releaseLock();
        const finalMessage = sentences.join(" ");
        setChatLog([...messageLog, { role: "assistant", content: finalMessage }]);
        setChatProcessing(false);
      }
    },
    [chatLog, openAiKey, modelProvider, systemPrompt, koeiroParam, handleSpeakAi]
  );

  return (
    <div className={"font-M_PLUS_2"}>
      <Meta />
      <Introduction
        openAiKey={openAiKey}
        koeiroMapKey={koeiromapKey}
        onChangeAiKey={setOpenAiKey}
        onChangeKoeiromapKey={setKoeiromapKey}
        modelProvider={modelProvider}
        onChangeModelProvider={setModelProvider}
      />
      <VrmViewer />
      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
      />
      <Menu
        openAiKey={openAiKey}
        systemPrompt={systemPrompt}
        chatLog={chatLog}
        koeiroParam={koeiroParam}
        assistantMessage={assistantMessage}
        koeiromapKey={koeiromapKey}
        onChangeAiKey={setOpenAiKey}
        onChangeSystemPrompt={setSystemPrompt}
        onChangeChatLog={handleChangeChatLog}
        onChangeKoeiromapParam={setKoeiroParam}
        handleClickResetChatLog={() => setChatLog([])}
        handleClickResetSystemPrompt={() => setSystemPrompt(SYSTEM_PROMPT)}
        onChangeKoeiromapKey={setKoeiromapKey}
      />
      <GitHubLink />
    </div>
  );
}
