// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@charcoal-ui/icons";
import AppContainer from "@/components/appContainer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppContainer Component={Component} pageProps={pageProps} />
  );
}
