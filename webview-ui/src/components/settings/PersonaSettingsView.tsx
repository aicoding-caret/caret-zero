import React, { useCallback, useState } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useExtensionState } from "../../context/ExtensionStateContext";
import { vscode } from "../../utils/vscode";
import styled from "styled-components";

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

export default function PersonaSettingsView() {
  const { personaList, selectedPersonaId, supportedLanguages } = useExtensionState();
  const [showAdd, setShowAdd] = useState(false);

  // 정책 안내문 (설계 문서 기준)
  const policyNotice =
    "기본값으로 초기화 시, 커스텀 퍼소나는 삭제되지 않고 그대로 남아 있습니다. 커스텀 퍼소나는 개별 삭제만 가능합니다.";

  // 이벤트 핸들러 예시 (실제 구현은 postMessage 구조로 확장)
  const handlePersonaDelete = useCallback((id: string) => {
    vscode.postMessage({ type: "deletePersona", personaId: id });
  }, []);

  const handlePersonaRestore = useCallback(() => {
    vscode.postMessage({ type: "restoreDefaultPersonas" });
  }, []);

  // 퍼소나 선택 핸들러
  const handlePersonaSelect = useCallback((id: string) => {
    if (id !== selectedPersonaId) {
      vscode.postMessage({ type: "selectPersona", personaId: id });
    }
  }, [selectedPersonaId]);

  // TODO: 추가/편집 폼 및 postMessage 연동 구현 필요

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
                  {/* TODO: 편집 버튼 등 추가 */}
                </PersonaActions>
              </PersonaItem>
            );
          })
        ) : (
          <span style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13 }}>등록된 퍼소나가 없습니다.</span>
        )}
      </PersonaList>
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <VSCodeButton appearance="primary" onClick={() => setShowAdd(true)}>
          퍼소나 추가
        </VSCodeButton>
        <VSCodeButton appearance="secondary" onClick={handlePersonaRestore}>
          기본값으로 초기화
        </VSCodeButton>
      </div>
      {/* TODO: 추가/편집 폼 구현 및 showAdd 상태 연동 */}
    </PersonaSection>
  );
}
