import { useState, useCallback, useEffect } from "react";
import { Link } from "./link";


type Props = {
  openAiKey: string;
  koeiroMapKey: string;
  onChangeAiKey: (openAiKey: string) => void;
  onChangeKoeiromapKey: (koeiromapKey: string) => void;
  modelProvider: "openai" | "ollama";
  onChangeModelProvider: (provider: "openai" | "ollama") => void;
};
export const Introduction = ({
  openAiKey,
  koeiroMapKey,
  modelProvider,
  onChangeAiKey,
  onChangeKoeiromapKey,
  onChangeModelProvider,
}: Props) => {
  const [opened, setOpened] = useState(true);

  const handleAiKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeAiKey(event.target.value);
    },
    [onChangeAiKey]
  );
  const handleKoeiromapKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeKoeiromapKey(event.target.value);
    },
    [onChangeKoeiromapKey]
  );

  const handleModelProviderChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChangeModelProvider(event.target.value);
    },
    [onChangeModelProvider]
  );

useEffect(() => {
  if (
    (modelProvider === "openai" && !openAiKey)
  ) {
    setOpened(true);
  } else {
    setOpened(false);
  }
}, [modelProvider, openAiKey]);


  return opened ? (
    <div className="absolute z-40 w-full h-full px-24 py-40  bg-black/30 font-M_PLUS_2">
      <div className="mx-auto my-auto max-w-3xl max-h-full p-24 overflow-auto bg-white rounded-16">
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary ">
            About this application
          </div>
          <div>
            You can enjoy conversations with a 3D character directly in your web browser using microphone input, text input, and speech synthesis. You can also change the character (VRM), adjust their personality, and customize the voice.
          </div>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
          Overview
          </div>
          <div>
            For displaying and controlling the 3D model
            <Link
              url={"https://github.com/pixiv/three-vrm"}
              label={"@pixiv/three-vrm"}
            />
            、 and for generating conversation text
            <Link
              url={
                "https://openai.com/blog/introducing-chatgpt-and-whisper-apis"
              }
              label={"ChatGPT API"}
            />
            、 for speech synthesis
            <Link url={"https://koemotion.rinna.co.jp/"} label={"Koemotion"} />
            の
            <Link
              url={
                "https://developers.rinna.co.jp/product/#product=koeiromap-free"
              }
              label={"Koeiromap API"}
            />
             is used. For more details, see:
            <Link
              url={"https://inside.pixiv.blog/2023/04/28/160000"}
              label={"技術解説記事"}
            />
          </div>
          
        {/* ------------------ Provider Selector ------------------ */}
          <div className="my-24">
            <div className="my-8 font-bold typography-20 text-secondary">
              Model Provider
            </div>
            <div>Select a model to use for chatting:</div>
            <select
              value={modelProvider}
              onChange={(e) => onChangeModelProvider(e.target.value as "openai" | "ollama")}
              className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4"
            >
              <option value="openai">OpenAI (ChatGPT)</option>
              <option value="ollama">Ollama (Local LLM)</option>
            </select>
          </div>
        {/* ------------------ End Provider Selector ------------------ */}


          <div className="my-16">
            This demo's source code is available on GitHub. Feel free to modify or customize it as you like!
            <br />
            Repository：
            <Link
              url={"https://github.com/pixiv/ChatVRM"}
              label={"https://github.com/pixiv/ChatVRM"}
            />
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            Precautions:
          </div>
          <div>
            Please do not intentionally prompt discriminatory, violent, or defamatory statements targeting specific individuals. Also, when replacing the character using a VRM model, be sure to follow the model’s usage terms.
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            Koeiromap APIキー
          </div>
          <input
            type="text"
            placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            value={koeiroMapKey}
            onChange={handleKoeiromapKeyChange}
            className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
          ></input>
          <div>
           Please obtain your API key from rinna Developers.
            <Link
              url="https://developers.rinna.co.jp/product/#product=koeiromap-free"
              label=" 詳細はこちら"
            />
          </div>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            OpenAI API
          </div>
          <input
            type="text"
            placeholder="sk-..."
            value={openAiKey}
            onChange={handleAiKeyChange}
            className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
          ></input>
          <div>
            API Key
            <Link
              url="https://platform.openai.com/account/api-keys"
              label=" OpenAIのサイト"
            />
            ...can be obtained from there. Please enter the obtained API key into the form.
          </div>
          <div className="my-16">
            ChatGPT
            The API is accessed directly from the browser. API keys and conversation content are not stored on Pixiv's servers.
            <br />
            *The model used is the ChatGPT API (GPT-3.5).*
          </div>
        </div>
        <div className="my-24">
          <button
            onClick={() => {
              setOpened(false);
            }}
            className="font-bold bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white px-24 py-8 rounded-oval"
          >
            Enter your API key to get started.
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
