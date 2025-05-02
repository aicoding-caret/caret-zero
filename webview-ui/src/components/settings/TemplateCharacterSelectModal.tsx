// TemplateCharacterSelectModal: 상단 아바타 탭 + 하단 상세 미리보기형으로 완전 재구현
import React, { useState, useEffect } from "react";
import styled from "styled-components";
// --- Modal import 경로 lint 오류 수정 ---
// 기존: import Modal from '../../common/Modal';
// 실제 위치: import Modal from '../common/Modal';
import Modal from '../common/Modal';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

export interface TemplateCharacterLocale {
  name: string;
  description: string;
  customInstruction: any;
}

export interface TemplateCharacter {
  character: string;
  [lang: string]: TemplateCharacterLocale | string | boolean | undefined;
  avatarUri: string;
  thinkingAvatarUri: string;
  introIllustrationUri: string;  
}

interface Props {
  characters: TemplateCharacter[];
  language: "ko" | "en";
  open: boolean;
  onSelect: (character: TemplateCharacter) => void;
  onClose: () => void;
}

const AvatarRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 18px;
  margin-bottom: 10px;
  align-items: center;
`;
const AvatarBtn = styled.button<{ selected: boolean }>`
  border: 2px solid ${p => (p.selected ? "#0078d4" : "#ccc")};
  background: #fff;
  border-radius: 50%;
  padding: 3px;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  transition: border 0.2s;
`;
const AvatarImg = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`;
const Name = styled.div`
  font-weight: bold;
  font-size: 22px;
  margin-bottom: 8px;
`;
const Illust = styled.img`
  width: 95%;
  max-width: 340px;
  height: auto;
  border-radius: 8px;
  margin-bottom: 10px;
`;
const Desc = styled.div`
  font-size: 15px;
  color: #333;
  background: #f9f9f9;
  border-radius: 6px;
  padding: 16px;
  margin: 0 8px 18px 8px;
  min-height: 40px;
`;
const SelectBtn = styled(VSCodeButton)`
  width: 100%;
  font-size: 17px;
  margin-top: 6px;
`;
const Notice = styled.div`
  font-size: 13px;
  color: #e0e0e0;
  margin-bottom: 12px;
  background: rgba(40,40,40,0.9);
  padding: 8px 12px;
  border-radius: 5px;
  font-weight: 500;
`;

// 모달 내용을 감싸는 컨테이너 추가
const ModalContent = styled.div`
  text-align: center;
  padding: 0 16px;
`;

const TemplateCharacterSelectModal: React.FC<Props> = ({ characters, language, open, onSelect, onClose }) => {
  const [selected, setSelected] = useState(0);
  const selectedChar = characters[selected];

  // --- 캐릭터 목록/탭 미표시 버그 디버깅용 로그 추가 ---
  console.log('[TemplateCharacterSelectModal] 렌더: characters', characters, 'selected', selected);

  // --- 템플릿 캐릭터 이미지/데이터 누락 시 fallback 처리 추가 ---
  const getSafeAvatarUri = (character: TemplateCharacter) => {
    return character.avatarUri || "/assets/template_characters/default_avatar.png";
  };
  const getSafeThinkingUri = (character: TemplateCharacter) => {
    return character.thinkingAvatarUri || "/assets/template_characters/default_thinking.png";
  };

  // 언어 locale 안전하게 가져오기 (동적, fallback)
  const getLocale = (character: TemplateCharacter, lang: string) => {
    // en이 항상 fallback
    return (character[lang] as TemplateCharacterLocale) || (character["en"] as TemplateCharacterLocale) || { name: "", description: "", customInstruction: "" };
  };

  const getSafeName = (character: TemplateCharacter, lang: string) => {
    return getLocale(character, lang).name || "이름 없음";
  };
  const getSafeDescription = (character: TemplateCharacter, lang: string) => {
    return getLocale(character, lang).description || "설명이 없습니다.";
  };

  // --- introIllustrationUri 누락 시 fallback 처리 추가 ---
  const getSafeIllustrationUri = (character: TemplateCharacter) => {
    return character.introIllustrationUri
      ? character.introIllustrationUri.replace("asset:/", "/assets/")
      : "/assets/template_characters/default_illustration.png";
  };

  // PersonaSettingsView에서 이미 템플릿 캐릭터를 요청하고 있으므로 중복 요청 제거
  // useEffect(() => {
  //   if (window.vscode && typeof window.vscode.postMessage === "function") {
  //     window.vscode.postMessage({ type: "requestTemplateCharacters" });
  //     console.log("[TemplateCharacterSelectModal] requestTemplateCharacters 메시지 전송!");
  //   } else {
  //     console.warn("[TemplateCharacterSelectModal] vscode API를 찾을 수 없습니다.");
  //   }
  // }, []);

  return (
    <Modal onClose={onClose} title="AI에이전트 템플릿 캐릭터 설정">
      <ModalContent>
        <Notice>
          * 원하는 캐릭터를 선택하세요. 선택한 캐릭터는 자유롭게 편집하여 나만의 퍼소나로 쓸 수 있습니다.
        </Notice>
        <AvatarRow style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {characters.map((c, i) => (
            <AvatarBtn key={c.character} selected={i === selected} onClick={() => setSelected(i)}>
              <AvatarImg src={getSafeAvatarUri(c).replace("asset:/", "/assets/")} alt={getSafeName(c, language)} />
            </AvatarBtn>
          ))}
        </AvatarRow>
        {selectedChar && (
          <>
            <Name>{getSafeName(selectedChar, language)}</Name>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Illust src={getSafeIllustrationUri(selectedChar)} alt="일러스트" />
            </div>
            <Desc>{getSafeDescription(selectedChar, language)}</Desc>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <SelectBtn appearance="primary" onClick={() => onSelect(selectedChar)}>
                선택
              </SelectBtn>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TemplateCharacterSelectModal;