import { useState, useEffect } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { vscode } from "../utils/vscode";
import styled from "styled-components";

const PersonaSection = styled.div`
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--vscode-settings-headerBorder);
`;

const PolicyNotice = styled.div`
  background: var(--vscode-editorWidget-background);
  color: var(--vscode-descriptionForeground);
  font-size: 13px;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 10px;
  text-align: center;
`;

export default function PersonaSettingsView() {
  const [templateCharacters, setTemplateCharacters] = useState<any[]>([]);

  useEffect(() => {
    // 템플릿 캐릭터 요청
    vscode.postMessage({ type: "requestTemplateCharacters" });
    
    const handler = (event: MessageEvent) => {
      const { data } = event;
      console.log("[PersonaSettingsView] Received message:", data);
      if (data.type === "templateCharactersLoaded") {
        console.log("[PersonaSettingsView] templateCharactersLoaded message received", data);
        if (Array.isArray(data.characters)) {
          console.log("[PersonaSettingsView] Setting template characters:", data.characters);
          setTemplateCharacters(data.characters);
        } else if (data.text) {
          try {
            const parsedCharacters = JSON.parse(data.text);
            console.log("[PersonaSettingsView] Parsed characters from text:", parsedCharacters);
            if (Array.isArray(parsedCharacters)) {
              setTemplateCharacters(parsedCharacters);
            }
          } catch (err) {
            console.error("[PersonaSettingsView] Failed to parse template characters:", err);
          }
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <PersonaSection>
      <h3>퍼소나 관리</h3>
      <PolicyNotice>
        Caret 페르소나 관리 시스템 (개발 중)
      </PolicyNotice>
      
      <div>
        <p>템플릿 캐릭터 수: {templateCharacters.length}</p>
        
        <VSCodeButton 
          onClick={() => {
            console.log("페르소나 로드 요청");
            vscode.postMessage({ type: "loadPersona" });
          }}
        >
          페르소나 로드
        </VSCodeButton>
        
        <VSCodeButton 
          onClick={() => {
            console.log("템플릿 캐릭터 요청");
            vscode.postMessage({ type: "requestTemplateCharacters" });
          }}
        >
          템플릿 캐릭터 새로고침
        </VSCodeButton>
      </div>
    </PersonaSection>
  );
}
