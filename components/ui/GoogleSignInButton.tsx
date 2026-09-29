"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/hooks/useTheme";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
}

export default function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Ref pro callback mais recente, não a prop direto: login/register re-renderizam a
  // cada tecla digitada nos outros campos, e usar `onCredential` como dependência do
  // efeito abaixo recriaria o botão do Google a cada uma delas.
  const onCredentialRef = useRef(onCredential);
  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: (response) => onCredentialRef.current(response.credential),
    });

    containerRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: theme === "dark" ? "filled_black" : "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      logo_alignment: "center",
      width: containerRef.current.offsetWidth || 320,
    });
  }, [scriptLoaded, theme]);

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client?hl=pt-BR" strategy="afterInteractive" onLoad={() => setScriptLoaded(true)} />
      <div ref={containerRef} className="flex w-full justify-center" />
    </>
  );
}
