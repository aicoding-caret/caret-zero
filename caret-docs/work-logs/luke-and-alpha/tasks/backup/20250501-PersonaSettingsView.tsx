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
    setError("");
    setShowAdd(true);
  };

  const openEditModal = (persona: any) => {
    setForm({
      id: persona.id,
      name: { ...persona.name },
      description: { ...persona.description },
      customInstructions: persona.customInstructions || "",
      avatarUri: persona.avatarUri || "",
      thinkingAvatarUri: persona.thinkingAvatarUri || "",
      isDefault: persona.isDefault,
      isEditable: persona.isEditable,
    });
    setEditPersona(persona);
    setError("");
    setShowAdd(true);
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditPersona(null);
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

    setShowAdd(false);
    setEditPersona(null);
  };

  // 템플릿 캐릭터 로드 요청
  useEffect(() => {
    vscode.postMessage({ type: "requestTemplateCharacters" });

    // 퍼소나가 없을 경우 템플릿 선택 모달 표시
    if (personaList.length === 0) {
      setShowTemplateModal(true);
    }
  }, [personaList.length]);

  // 템플릿 캐릭터 로드 응답 처리
  const handleTemplateCharactersLoaded = (event: MessageEvent) => {
    const message = event.data;
    if (message.type === "templateCharactersLoaded") {
      console.log("Template characters loaded:", message.characters);
      setTemplateCharacters(message.characters);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleTemplateCharactersLoaded);
    return () => {
      window.removeEventListener("message", handleTemplateCharactersLoaded);
    };
  }, []);

  // 템플릿 캐릭터 선택 처리
  const handleTemplateSelect = (character: TemplateCharacter) => {
    const newPersona: PersonaForm = {
      id: "persona-" + Date.now(),
      name: { ...character.name },
      description: { ...character.description },
      customInstructions: character.customInstructions || "",
      avatarUri: character.avatarUri || "",
      thinkingAvatarUri: character.thinkingAvatarUri || "",
      isDefault: false,
      isEditable: true,
    };

    vscode.postMessage({
      type: "addOrUpdatePersona",
      persona: newPersona,
    });

    setShowTemplateModal(false);
  };

  return (
    <PersonaSection>
      <h3>퍼소나 관리</h3>
      <PolicyNotice>{policyNotice}</PolicyNotice>
      <PersonaList>
        {personaList.length > 0 ? (
          personaList.map((persona) => {
            return (
              <PersonaItem key={persona.id}>
                {persona.avatarUri ? (
                  <PersonaAvatar src={persona.avatarUri} alt={persona.name.ko || persona.name.en || persona.id} />
                ) : (
                  <PersonaAvatar
                    src="https://raw.githubusercontent.com/fstory97/caret-avatar/main/default-avatar.png"
                    alt={persona.name.ko || persona.name.en || persona.id}
                  />
                )}
                <PersonaRadio
                  checked={persona.id === selectedPersonaId}
                  onChange={() => handlePersonaSelect(persona.id)}
                  name="persona"
                />
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
