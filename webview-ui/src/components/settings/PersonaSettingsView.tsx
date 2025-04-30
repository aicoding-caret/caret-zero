import React, { useCallback, useState, useEffect } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useExtensionState } from "../../context/ExtensionStateContext";
import { vscode } from "../../utils/vscode";
import styled from "styled-components";
import Modal from "../../components/common/Modal";
import { VSCodeTextField, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";
import TemplateCharacterSelectModal, { TemplateCharacter } from "./TemplateCharacterSelectModal";

const PersonaRadio = styled.input.attrs({ type: "radio" })`
  accent-color: #0078d4;
  width: 18px;
  height: 18px;
  margin-right: 8px;
`;

const PersonaSection = styled.div`
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--vscode-settings-headerBorder);
`;

const PersonaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PersonaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--vscode-settings-headerBorder);
  &:last-child { border-bottom: none; }
`;

const PersonaAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--vscode-editor-background);
`;

const PersonaInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const PersonaName = styled.span`
  font-weight: bold;
`;

const PersonaDesc = styled.span`
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
`;

const PersonaActions = styled.div`
  display: flex;
  gap: 8px;
`;

const PolicyNotice = styled.div`
  background: var(--vscode-editorWidget-background);
  color: var(--vscode-descriptionForeground);
  font-size: 12px;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 10px;
`;

interface PersonaForm {
  id: string;
  name: { [lang: string]: string };
  description: { [lang: string]: string };
  customInstructions: string;
  avatarUri: string;
  thinkingAvatarUri: string;
  isDefault: boolean;
  isEditable: boolean;
}

export default function PersonaSettingsView() {
  const { personaList, selectedPersonaId, supportedLanguages, selectedLanguage } = useExtensionState();
  const [showAdd, setShowAdd] = useState(false);
  const [editPersona, setEditPersona] = useState<PersonaForm | null>(null);
  const [form, setForm] = useState<PersonaForm>({
    id: "",
    name: {},
    description: {},
    customInstructions: "",
    avatarUri: "",
    thinkingAvatarUri: "",
    isDefault: false,
    isEditable: true,
  });
  const [error, setError] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateCharacters, setTemplateCharacters] = useState<TemplateCharacter[]>([]);

  console.log('[PersonaSettingsView] mount');

  const policyNotice = "기본값으로 초기화 시, 커스텀 퍼소나는 삭제되지 않고 그대로 남아 있습니다. 커스텀 퍼소나는 개별 삭제만 가능합니다.";

  const handlePersonaDelete = useCallback((id: string) => {
    vscode.postMessage({ type: "deletePersona", personaId: id });
  }, []);

  const handlePersonaRestore = useCallback(() => {
    vscode.postMessage({ type: "restoreDefaultPersonas" });
  }, []);

  const handlePersonaSelect = useCallback((id: string) => {
    if (id !== selectedPersonaId) {
      vscode.postMessage({ type: "selectPersona", personaId: id });
    }
  }, [selectedPersonaId]);

  const handleInput = (field: keyof PersonaForm, value: string, lang?: string) => {
    setForm((prev) => {
      if ((field === "name" || field === "description") && lang) {
        return { ...prev, [field]: { ...prev[field], [lang]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  const openAddModal = () => {
    setForm({
      id: "persona-" + Date.now(),
      name: { [selectedLanguage || "ko"]: "" },
      description: { [selectedLanguage || "ko"]: "" },
      customInstructions: "",
      avatarUri: "",
      thinkingAvatarUri: "",
      isDefault: false,
      isEditable: true,
    });
    setEditPersona(null);
    setShowAdd(true);
    setError("");
  };

  const openEditModal = (persona: any) => {
    setForm({
      id: persona.id,
      name: persona.name || {},
      description: persona.description || {},
      customInstructions: persona.customInstructions || "",
      avatarUri: persona.avatarUri || "",
      thinkingAvatarUri: persona.thinkingAvatarUri || "",
      isDefault: !!persona.isDefault,
      isEditable: persona.isEditable !== false,
    });
    setEditPersona(persona);
    setShowAdd(true);
    setError("");
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditPersona(null);
    setError("");
  };

  const handleSave = () => {
    const langs = supportedLanguages || [selectedLanguage || "ko", "en"];
    let valid = false;
    langs.forEach((lang) => {
      if (form.name?.[lang] && form.description?.[lang]) valid = true;
    });
    if (!valid || !form.customInstructions) {
      setError("이름, 설명, 지침을 모두 입력해주세요 (최소 1개 언어)");
      return;
    }
    vscode.postMessage({
      type: "addOrUpdatePersona",
      persona: form,
    });
    closeModal();
  };

  useEffect(() => {
    console.log('[PersonaSettingsView] mount, template 캐릭터 로딩 요청');
    if (window.vscode && typeof window.vscode.postMessage === "function") {
      window.vscode.postMessage({ type: "requestTemplateCharacters" });
      console.log('[PersonaSettingsView] requestTemplateCharacters 메시지 전송');
    } else {
      console.warn("[PersonaSettingsView] window.vscode.postMessage is not available (likely not running in VSCode webview)");
    }
  }, []);

  useEffect(() => {
    function handleTemplateCharactersLoaded(event: MessageEvent) {
      if (event.data && event.data.type === "templateCharactersLoaded" && event.data.text) {
        try {
          const data = JSON.parse(event.data.text);
          setTemplateCharacters(data);
          console.log('[PersonaSettingsView] templateCharactersLoaded 수신, 데이터:', data);
        } catch (err) {
          console.error("템플릿 캐릭터 파싱 실패", err);
        }
      }
    }
    window.addEventListener("message", handleTemplateCharactersLoaded);
    return () => window.removeEventListener("message", handleTemplateCharactersLoaded);
  }, []);

  useEffect(() => {
    console.log('[PersonaSettingsView] templateCharacters 상태 변경:', templateCharacters);
  }, [templateCharacters]);

  const handleTemplateSelect = (character: TemplateCharacter) => {
    console.log('[PersonaSettingsView] 캐릭터 선택됨', character);
    const lang: "ko" | "en" = selectedLanguage === "en" ? "en" : "ko";
    const persona = {
      id: `persona-${Date.now()}`,
      name: { [lang]: character[lang].name },
      description: { [lang]: character[lang].description },
      customInstructions: character[lang].customInstruction || "",
      avatarUri: character.avatarUri,
      thinkingAvatarUri: character.thinkingAvatarUri,
      isDefault: false,
      isEditable: true,
    };
    vscode.postMessage({ type: "addOrUpdatePersona", persona });
    setShowTemplateModal(false);
    console.log('[PersonaSettingsView] persona 추가 postMessage 전송', persona);
  };

  return (
    <PersonaSection>
      <h3>퍼소나 관리</h3>
      <PolicyNotice>{policyNotice}</PolicyNotice>
      <PersonaList>
        {personaList && personaList.length > 0 ? (
          personaList.map((persona) => {
            const isSelected = persona.id === selectedPersonaId;
            return (
              <PersonaItem key={persona.id} style={isSelected ? { background: "#e6f0fa", borderRadius: 6, border: "1.5px solid #0078d4" } : {}}>
                <PersonaRadio
                  name="persona-select"
                  checked={isSelected}
                  onChange={() => handlePersonaSelect(persona.id)}
                  aria-label={persona.name.ko || persona.name.en || persona.id}
                  style={{ marginRight: 8 }}
                />
                {persona.avatarUri ? (
                  <PersonaAvatar src={persona.avatarUri} alt={persona.name.ko || persona.name.en || "avatar"} />
                ) : (
                  <PersonaAvatar src="https://raw.githubusercontent.com/fstory97/caret-avatar/main/alpha-maid.png" alt="avatar" />
                )}
                <PersonaInfo>
                  <PersonaName>
                    {persona.name.ko || persona.name.en || persona.id}
                    {persona.isDefault && <span style={{ marginLeft: 6, color: "#888", fontSize: 10 }}>(기본)</span>}
                  </PersonaName>
                  <PersonaDesc>{persona.description?.ko || persona.description?.en || ""}</PersonaDesc>
                </PersonaInfo>
                <PersonaActions>
                  {persona.isDefault ? null : (
                    <VSCodeButton appearance="secondary" onClick={() => handlePersonaDelete(persona.id)}>
                      삭제
                    </VSCodeButton>
                  )}
                  {persona.isEditable && (
                    <VSCodeButton appearance="secondary" onClick={() => openEditModal(persona)}>
                      편집
                    </VSCodeButton>
                  )}
                </PersonaActions>
              </PersonaItem>
            );
          })
        ) : (
          <span style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13 }}>등록된 퍼소나가 없습니다.</span>
        )}
      </PersonaList>
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <VSCodeButton appearance="secondary" onClick={() => setShowTemplateModal(true)}>
          템플릿 캐릭터 선택
        </VSCodeButton>
      </div>
      {showAdd && (
        <Modal onClose={closeModal} title={editPersona ? "퍼소나 편집" : "퍼소나 추가"}>
          {supportedLanguages?.map((lang) => (
            <div key={lang} style={{ marginBottom: 8 }}>
              <VSCodeTextField
                value={form.name?.[lang] || ""}
                onInput={(e) => handleInput("name", (e.target as HTMLInputElement).value, lang)}
                placeholder={`이름 (${lang})`}
                style={{ width: "100%", marginBottom: 4 }}
              />
              <VSCodeTextArea
                value={form.description?.[lang] || ""}
                onInput={(e) => handleInput("description", (e.target as HTMLTextAreaElement).value, lang)}
                placeholder={`설명 (${lang})`}
                style={{ width: "100%", minHeight: 40 }}
              />
            </div>
          ))}
          <VSCodeTextArea
            value={form.customInstructions}
            onInput={(e) => handleInput("customInstructions", (e.target as HTMLTextAreaElement).value)}
            placeholder="영문 custom instructions (권장)"
            style={{ width: "100%", minHeight: 40, marginBottom: 8 }}
          />
          <VSCodeTextField
            value={form.avatarUri}
            onInput={(e) => handleInput("avatarUri", (e.target as HTMLInputElement).value)}
            placeholder="프로필 이미지 URL (선택)"
            style={{ width: "100%", marginBottom: 4 }}
          />
          <VSCodeTextField
            value={form.thinkingAvatarUri}
            onInput={(e) => handleInput("thinkingAvatarUri", (e.target as HTMLInputElement).value)}
            placeholder="생각 중 이미지 URL (선택)"
            style={{ width: "100%", marginBottom: 4 }}
          />
          {error && <div style={{ color: "var(--vscode-errorForeground)", marginBottom: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <VSCodeButton appearance="primary" onClick={handleSave}>
              저장
            </VSCodeButton>
            <VSCodeButton appearance="secondary" onClick={closeModal}>
              취소
            </VSCodeButton>
          </div>
        </Modal>
      )}
      {showTemplateModal && (
        <TemplateCharacterSelectModal
          characters={templateCharacters}
          language={selectedLanguage === "en" ? "en" : "ko"}
          open={showTemplateModal}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </PersonaSection>
  );
}
