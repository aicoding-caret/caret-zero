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

const PersonaAvatarSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const AvatarButton = styled.button<{ selected: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  border: 3px solid ${props => props.selected ? 'var(--vscode-focusBorder)' : 'transparent'};
  transition: border-color 0.2s;
  background: transparent;
  
  &:hover {
    border-color: var(--vscode-focusBorder);
    opacity: 0.9;
  }
`;

const PersonaDetailSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: var(--vscode-editor-background);
  border-radius: 4px;
  border: 1px solid var(--vscode-settings-headerBorder);
`;

const PersonaDetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const PersonaDetailAvatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--vscode-editor-background);
`;

const PersonaDetailInfo = styled.div`
  flex: 1;
`;

const PersonaDetailName = styled.h4`
  margin: 0 0 4px 0;
  font-size: 16px;
`;

const PersonaDetailDesc = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
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
  const [editingPersona, setEditingPersona] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  console.log('[PersonaSettingsView] mount');

  const policyNotice = "템플릿 캐릭터 선택 시 현재 퍼소나가 덮어씌워집니다. 초기화를 원하시면 템플릿 캐릭터 선택 버튼을 눌러 새 템플릿으로 교체하세요.";

  const handlePersonaDelete = useCallback((id: string) => {
    vscode.postMessage({ type: "deletePersona", personaId: id });
  }, []);

  const handlePersonaSelect = useCallback((id: string) => {
    if (id !== selectedPersonaId) {
      vscode.postMessage({ type: "selectPersona", personaId: id });
      
      const selectedPersona = personaList.find(p => p.id === id);
      if (selectedPersona) {
        setForm({
          id: selectedPersona.id,
          name: { ...selectedPersona.name },
          description: { ...selectedPersona.description },
          customInstructions: selectedPersona.customInstructions || "",
          avatarUri: selectedPersona.avatarUri || "",
          thinkingAvatarUri: selectedPersona.thinkingAvatarUri || "",
          isDefault: selectedPersona.isDefault,
          isEditable: selectedPersona.isEditable,
        });
        setHasChanges(false);
      }
    }
  }, [selectedPersonaId, personaList]);

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
    setEditingPersona(false);
  };

  useEffect(() => {
    vscode.postMessage({ type: "requestTemplateCharacters" });

    if (personaList.length === 0) {
      setShowTemplateModal(true);
    }
  }, [personaList.length]);

  useEffect(() => {
    if (selectedPersonaId) {
      const selectedPersona = personaList.find(p => p.id === selectedPersonaId);
      if (selectedPersona) {
        setForm({
          id: selectedPersona.id,
          name: { ...selectedPersona.name },
          description: { ...selectedPersona.description },
          customInstructions: selectedPersona.customInstructions || "",
          avatarUri: selectedPersona.avatarUri || "",
          thinkingAvatarUri: selectedPersona.thinkingAvatarUri || "",
          isDefault: selectedPersona.isDefault,
          isEditable: selectedPersona.isEditable,
        });
        setHasChanges(false);
      }
    }
  }, [selectedPersonaId, personaList]);

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

  const selectedPersona = personaList.find(p => p.id === selectedPersonaId);

  const defaultAvatarUrl = "https://raw.githubusercontent.com/fstory97/caret-avatar/main/default-avatar.png";

  return (
    <PersonaSection>
      <h3>퍼소나 관리</h3>
      <PolicyNotice>{policyNotice}</PolicyNotice>
      
      <PersonaAvatarSelector>
        {personaList.length > 0 ? (
          personaList.map((persona) => (
            <AvatarButton 
              key={persona.id} 
              selected={persona.id === selectedPersonaId}
              onClick={() => handlePersonaSelect(persona.id)}
              title={persona.name.ko || persona.name.en || persona.id}
            >
              <PersonaAvatar 
                src={persona.avatarUri || defaultAvatarUrl} 
                alt={persona.name.ko || persona.name.en || persona.id} 
              />
            </AvatarButton>
          ))
        ) : (
          <span style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13 }}>등록된 퍼소나가 없습니다.</span>
        )}
      </PersonaAvatarSelector>
      
      <div style={{ marginBottom: 16 }}>
        <VSCodeButton appearance="secondary" onClick={() => setShowTemplateModal(true)}>
          템플릿 캐릭터 선택
        </VSCodeButton>
      </div>
      
      {selectedPersona && (
        <PersonaDetailSection>
          <PersonaDetailHeader>
            <PersonaDetailAvatar 
              src={selectedPersona.avatarUri || defaultAvatarUrl} 
              alt={selectedPersona.name.ko || selectedPersona.name.en || selectedPersona.id} 
            />
            <PersonaDetailInfo>
              <PersonaDetailName>
                {selectedPersona.name.ko || selectedPersona.name.en || selectedPersona.id}
                {selectedPersona.isDefault && <span style={{ marginLeft: 6, color: "#888", fontSize: 10 }}>(기본)</span>}
              </PersonaDetailName>
              <PersonaDetailDesc>
                {selectedPersona.description?.ko || selectedPersona.description?.en || ""}
              </PersonaDetailDesc>
            </PersonaDetailInfo>
          </PersonaDetailHeader>
          
          {selectedPersona.isEditable && (
            <div>
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
              
              {hasChanges && (
                <SettingsSaveButton appearance="primary" onClick={handleSave}>
                  저장
                </SettingsSaveButton>
              )}
            </div>
          )}
          
          {!selectedPersona.isDefault && (
            <div style={{ marginTop: 16 }}>
              <VSCodeButton appearance="secondary" onClick={() => handlePersonaDelete(selectedPersona.id)}>
                삭제
              </VSCodeButton>
            </div>
          )}
        </PersonaDetailSection>
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
