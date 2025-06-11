// TemplateCharacterSelectModal: 상단 아바타 탭 + 하단 상세 미리보기형으로 완전 재구현
import React from 'react';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

export interface TemplateCharacter {
  id: string;
  name: string;
  description: string;
  avatarUri?: string;
  thinkingAvatarUri?: string;
  customInstructions?: string;
}

export interface TemplateCharacterLocale {
  name: string;
  description: string;
  customInstruction?: any;
}

interface Props {
  characters: TemplateCharacter[];
  language: string;
  open: boolean;
  onSelect: (character: TemplateCharacter) => void;
  onClose: () => void;
}

export default function TemplateCharacterSelectModal({ characters, language, open, onSelect, onClose }: Props) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--vscode-editor-background)',
        padding: '20px',
        borderRadius: '4px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3>템플릿 캐릭터 선택</h3>
        
        <div style={{ marginBottom: '20px' }}>
          {characters.map((character) => (
            <div key={character.id} style={{
              border: '1px solid var(--vscode-settings-headerBorder)',
              margin: '10px 0',
              padding: '10px',
              borderRadius: '4px'
            }}>
              <h4>{character.name}</h4>
              <p>{character.description}</p>
              <VSCodeButton 
                onClick={() => onSelect(character)}
                appearance="primary"
              >
                선택
              </VSCodeButton>
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <VSCodeButton onClick={onClose}>
            닫기
          </VSCodeButton>
        </div>
      </div>
    </div>
  );
}