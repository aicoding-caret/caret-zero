# AI에이전트 템플릿 캐릭터/퍼소나 관리 정책 (2025-04-30)

## 1. 목적
- 유저가 Caret 설치/초기화 시 4명 템플릿 캐릭터 중 한 명을 직접 선택하여, 내 퍼소나로 삼는 경험을 제공
- 캐릭터의 개성과 컨셉이 명확하게 드러나도록 일러스트/설명/아바타 구조를 표준화

## 2. 리소스/파일 구조
- 모든 템플릿 캐릭터 리소스 및 json은 `assets/template_characters/`에 위치
- 파일명 규칙:
  - `[이름].png` (아바타, 64x64)
  - `[이름]_thinking.png` (생각중, 64x64)
  - `[이름]_illust.png` (소개 일러스트, 800x480)
  - `template_characters.json` (캐릭터 정보)

## 3. template_characters.json 예시
```json
[
  {
    "id": "sarang",
    "name": { "ko": "사랑이", "en": "Sarang" },
    "description": {
      "ko": "감정을 수학적으로 해석하는 조용한 소녀. 엉뚱하고 츤데레 기질.",
      "en": "A quiet girl who interprets emotions mathematically. Quirky and a bit tsundere."
    },
    "avatarUri": "asset:/assets/template_characters/sarang.png",
    "thinkingAvatarUri": "asset:/assets/template_characters/sarang_thinking.png",
    "introIllustrationUri": "asset:/assets/template_characters/sarang_illust.png",
    "customInstructions": "...",
    "isDefault": true
  },
  // ... (3명 추가)
]
```

## 4. UX/로직 정책
- Caret 설치/초기화/내 퍼소나 삭제 시 → 템플릿 캐릭터 선택 모달 자동 팝업
- 4명 캐릭터 카드(탭) 한 줄, 각 카드 상단에 소개 일러스트(800x480), 그 아래 아바타(64x64)
- 이름/설명(고정, 편집 불가) 표시, 하단에 "선택" 버튼
- 선택 후 내 퍼소나로 복사, 이름/인스트럭션/이미지(아바타/생각중)만 편집 가능
- description/일러스트는 편집 불가, 캐릭터 변경 원하면 내 퍼소나 삭제/초기화 → 모달 재노출

## 5. 안내문 예시
> 원하는 캐릭터를 선택하세요. 선택한 캐릭터는 자유롭게 편집하여 나만의 퍼소나로 쓸 수 있습니다.

## 6. 기타
- 기존 정책/흔적(다국어 커스텀, 멀티 슬롯 등)은 모두 폐기, 본 정책 기준으로 통일
- template_characters.json 및 이미지 리소스는 항상 동기화/유지

## 7. 구현 Task/체크리스트 (Development Checklist)

- [ ] template_characters.json 구조(다국어, customInstruction json)로 4명 정보 로드
- [ ] 카드 UI: 일러스트(800x480) + 아바타(64x64) + 이름/설명(고정)
- [ ] 선택 시 하이라이트, 하단 “선택” 버튼, 안내문 노출
- [ ] 선택 시 내 퍼소나로 복사(이름/아바타/생각중/커스텀 인스트럭션만 편집 가능)
- [ ] activePersona 1개만 관리(다중 슬롯/커스텀 정책 흔적 완전 제거)
- [ ] persona 데이터 저장/불러오기 시 새 구조 반영(customInstruction json 오브젝트)
- [ ] persona 삭제/초기화 시 템플릿 선택 모달 자동 진입
- [ ] description/일러스트/호칭 등은 편집 불가(고정 표시)
- [ ] 이름/아바타/생각중/커스텀 인스트럭션만 편집 가능
- [ ] customInstruction json 오브젝트 기반 편집/저장/적용
- [ ] ExtensionStateContext 등에서 persona 구조/로직 일치
- [ ] template_characters.json 및 이미지 경로 연동, 누락 시 fallback 처리
- [ ] 안내문, 피드백, UX 흐름(선택/초기화/편집 등) 정책과 완전 일치

---
