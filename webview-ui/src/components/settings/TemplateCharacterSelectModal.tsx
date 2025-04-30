// TemplateCharacterSelectModal: 상단 아바타 탭 + 하단 상세 미리보기형으로 완전 재구현
import React, { useState } from "react";
import styled from "styled-components";
// --- Modal import 경로 lint 오류 수정 ---
// 기존: import Modal from '../../common/Modal';
// 실제 위치: import Modal from '../common/Modal';
import Modal from '../common/Modal';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

export interface TemplateCharacter {
  character: string;
  en: {
    name: string;
    description: string;
    customInstruction: any;
  };
  ko: {
    name: string;
    description: string;
    customInstruction: any;
  };
  avatarUri: string;
  thinkingAvatarUri: string;
  introIllustrationUri: string;
  isDefault: boolean;
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
  padding: 10px;
  margin-bottom: 18px;
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

const TemplateCharacterSelectModal: React.FC<Props> = ({ characters, language, open, onSelect, onClose }) => {
  const [selected, setSelected] = useState(0);
  const t = (c: TemplateCharacter) => (language === "ko" ? c.ko : c.en);
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
  const getSafeName = (character: TemplateCharacter, lang: "ko" | "en") => {
    return character[lang]?.name || "이름 없음";
  };
  const getSafeDescription = (character: TemplateCharacter, lang: "ko" | "en") => {
    return character[lang]?.description || "설명이 없습니다.";
  };

  // --- introIllustrationUri 누락 시 fallback 처리 추가 ---
  const getSafeIllustrationUri = (character: TemplateCharacter) => {
    return character.introIllustrationUri
      ? character.introIllustrationUri.replace("asset:/", "/assets/")
      : "/assets/template_characters/default_illustration.png";
  };

  return (
    <Modal onClose={onClose} title="AI에이전트 템플릿 캐릭터 설정">
      <Notice>
        * 원하는 캐릭터를 선택하세요. 선택한 캐릭터는 자유롭게 편집하여 나만의 퍼소나로 쓸 수 있습니다.
      </Notice>
      <AvatarRow>
        {characters.map((c, i) => (
          <AvatarBtn key={c.character} selected={i === selected} onClick={() => setSelected(i)}>
            <AvatarImg src={getSafeAvatarUri(c).replace("asset:/", "/assets/")} alt={getSafeName(c, language)} />
          </AvatarBtn>
        ))}
      </AvatarRow>
      {selectedChar && (
        <>
          <Name>{getSafeName(selectedChar, language)}</Name>
          <Illust src={getSafeIllustrationUri(selectedChar)} alt="일러스트" />
          <Desc>{getSafeDescription(selectedChar, language)}</Desc>
          <SelectBtn appearance="primary" onClick={() => onSelect(selectedChar)}>
            선택
          </SelectBtn>
        </>
      )}
    </Modal>
  );
};

export default TemplateCharacterSelectModal;