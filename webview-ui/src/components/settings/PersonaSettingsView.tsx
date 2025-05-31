import  { useState, useEffect } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useExtensionState } from "../../context/ExtensionStateContext";
import { vscode } from "../../utils/vscode";
import styled from "styled-components";
import { VSCodeTextField, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";
import TemplateCharacterSelectModal, { TemplateCharacter, TemplateCharacterLocale } from "./TemplateCharacterSelectModal";
import { DEFAULT_LANGUAGE } from "../../utils/i18n";

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


const PersonaDetailSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: var(--vscode-editor-background);
  border-radius: 4px;
  border: 1px solid var(--vscode-settings-headerBorder);
`;


const SettingsSaveButton = styled(VSCodeButton)`
  margin-top: 16px;
`;

interface PersonaForm {
  id: string;
  name: { [lang: string]: string };
  description: { [lang: string]: string };
  customInstructions: string;
  avatarUri: string;
  thinkingAvatarUri: string;
}

export default function PersonaSettingsView() {
  const { supportedLanguages, selectedLanguage, chatSettings } = useExtensionState();
  const [form, setForm] = useState<PersonaForm>({
    id: "",
    name: {},
    description: {},
    customInstructions: "",
    avatarUri: "",
    thinkingAvatarUri: "",
  });
  const [error, setError] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateCharacters, setTemplateCharacters] = useState<TemplateCharacter[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  console.log('[PersonaSettingsView] mount');

  const policyNotice = "템플릿 캐릭터 선택 시 현재 퍼소나가 덮어씌워집니다. 초기화를 원하시면 템플릿 캐릭터 선택 버튼을 눌러 새 템플릿으로 교체하세요.";

  const handleInput = (field: keyof PersonaForm, value: string, lang?: string) => {
    setForm((prev) => {
      if ((field === "name" || field === "description") && lang) {
        return { ...prev, [field]: { ...prev[field], [lang]: value } };
      }
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!form.name[selectedLanguage || "ko"]) {
      setError("이름을 입력해주세요.");
      return;
    }

    vscode.postMessage({
      type: "addOrUpdatePersona",
      persona: form,
    });

    setHasChanges(false);
  };

  useEffect(() => {
    console.log("[PersonaSettingsView] Sending requestTemplateCharacters message");
    vscode.postMessage({ type: "requestTemplateCharacters" });
  }, []);

  useEffect(() => {
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

  const handleTemplateSelect = (character: TemplateCharacter) => {
    const lang = selectedLanguage || DEFAULT_LANGUAGE;
    const locale = (character[lang] as TemplateCharacterLocale) || (character[DEFAULT_LANGUAGE] as TemplateCharacterLocale);
  
    // 커스텀 인스트럭션 데이터 준비 (객체면 문자열로 변환)
    const customInstructionData = typeof locale.customInstruction === 'object' ? 
      JSON.stringify(locale.customInstruction) : 
      locale.customInstruction;

    // 기존 업데이트 로직을 타도록 설정
    vscode.postMessage({
      type: "updateSettings",
      chatSettings: {
        ...chatSettings,
        customInstructions: customInstructionData
      },
      apiConfiguration: null,
      telemetrySetting: null,
      planActSeparateModelsSetting: null
    });

    // 이미지 선택 로직 - TMP 이미지로 복사하도록 요청
    if (character.avatarUri) {
      // 상대 경로로 변환 (asset:/ 제거)
      const relativePath = character.avatarUri.replace("asset:/", "");
      
      vscode.postMessage({
        type: "selectAgentProfileImage",
        imageType: "default",
        text: relativePath
      });
    }
    
    if (character.thinkingAvatarUri) {
      // 상대 경로로 변환 (asset:/ 제거)
      const relativePath = character.thinkingAvatarUri.replace("asset:/", "");
      
      vscode.postMessage({
        type: "selectAgentProfileImage",
        imageType: "thinking",
        text: relativePath
      });
    }

    // 모달 닫기
    setShowTemplateModal(false);
  };

  return (
    <PersonaSection>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>퍼소나 관리</h3>
        <VSCodeButton appearance="secondary" onClick={() => setShowTemplateModal(true)}>
          템플릿 캐릭터
        </VSCodeButton>
      </div>
      <PolicyNotice>{policyNotice}</PolicyNotice>
      
      {/* 템플릿 캐릭터 선택 모달 */}
      {showTemplateModal && (
        <TemplateCharacterSelectModal
          characters={templateCharacters}
          language={
            supportedLanguages?.includes(selectedLanguage as string)
              ? (selectedLanguage as "en" | "ko")
              : DEFAULT_LANGUAGE
          }
          open={showTemplateModal}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

     
    </PersonaSection>
  );
}
