# 018-01-02 템플릿 캐릭터/퍼소나 관리 정책 및 설계

## 1. 목적
- 유저가 Caret 설치/초기화/내 퍼소나 삭제 시 4명 템플릿 캐릭터 중 한 명을 직접 선택하여, 내 퍼소나로 삼는 경험을 제공
- 캐릭터의 개성과 컨셉이 명확하게 드러나도록 일러스트/설명/아바타 구조를 표준화

## 2. 리소스/파일 구조
- 모든 템플릿 캐릭터 리소스 및 json은 `assets/template_characters/`에 위치
- 파일명 규칙:
  - `[이름].png` (아바타, 64x64)
  - `[이름]_thinking.png` (생각중, 64x64)
  - `[이름]_illust.png` (소개 일러스트, 800x480)
- 템플릿 캐릭터 정보는 `template_characters.json`에 다국어/커스텀 인스트럭션 구조로 저장

## 3. 정책/UX 원칙
- Caret 설치/초기화/내 퍼소나 삭제 시 → 템플릿 캐릭터 선택 모달 자동 팝업
- 4명 캐릭터 카드(탭) 한 줄, 각 카드 상단에 소개 일러스트(800x480), 그 아래 아바타(64x64)
- 이름/설명(고정, 편집 불가) 표시, 하단에 "선택" 버튼
- 선택 후 내 퍼소나로 복사, 이름/인스트럭션/이미지(아바타/생각중)만 편집 가능
- description/일러스트는 편집 불가, 캐릭터 변경 원하면 내 퍼소나 삭제/초기화 → 모달 재노출
- template_characters.json 및 이미지 리소스는 항상 동기화/유지

## 4. 예외/금지사항
- 기존 정책/흔적(다국어 커스텀, 멀티 슬롯 등)은 모두 폐기, 본 정책 기준으로 통일
- 정책/설계 변경 시 반드시 본 문서부터 업데이트 후 구현체 체크리스트 반영

## 5. 안내문 예시
> 원하는 캐릭터를 선택하세요. 선택한 캐릭터는 자유롭게 편집하여 나만의 퍼소나로 쓸 수 있습니다.

---

## 6. 메시지 흐름 및 저장 기능 설계

### 6.1 퍼소나 저장 기능 흐름
1. 웹뷰에서 퍼소나 편집 후 저장 버튼 클릭
2. `PersonaSettingsView.tsx`의 `handleSave` 함수에서 `addOrUpdatePersona` 타입의 메시지 전송
3. `PersonaController.ts`에서 메시지 수신 및 `handleAddOrUpdatePersona` 메서드 호출
4. `PersonaManager.ts`의 `addOrUpdatePersona` 메서드로 퍼소나 데이터 저장
5. 저장 완료 후 상태 업데이트하여 웹뷰에 반영

### 6.2 퍼소나 데이터 구조
```typescript
interface Persona {
  id: string;
  name: { [lang: string]: string };
  description: { [lang: string]: string };
  customInstructions: string;
  avatarUri: string;
  thinkingAvatarUri: string;
  isDefault: boolean;
  isEditable: boolean;
}
```

### 6.3 메시지 처리 구조
- 웹뷰 메시지 타입: `addOrUpdatePersona`
- 전송 데이터: `{ type: "addOrUpdatePersona", persona: PersonaForm }`
- 처리 흐름:
  1. `PersonaController.canHandle` 메서드에서 메시지 타입 확인
  2. `PersonaController.handleMessage`에서 해당 메시지 타입에 따라 적절한 핸들러 호출
  3. `PersonaController.handleAddOrUpdatePersona`에서 실제 저장 처리

### 6.4 퍼소나 저장 관련 파일 구조
- `webview-ui/src/components/settings/PersonaSettingsView.tsx`: 퍼소나 편집 UI 및 저장 버튼 처리
- `src/core/controller/persona-controller.ts`: 퍼소나 관련 메시지 처리
- `src/core/persona/PersonaManager.ts`: 퍼소나 데이터 저장/불러오기 기능
- `webview-ui/src/context/ExtensionStateContext.tsx`: 퍼소나 상태 관리

# (이하 상세 설계/데이터 구조/상태 관리/파일 I/O/에러 처리/확장성 등은 기존 design.md에서 최신 기준만 발췌해 추가)
