# Caret i18n/Locale 시스템 현황

## 개요
Caret 프로젝트는 다국어 지원(i18n) 및 locale 기반 텍스트/캐릭터 관리를 위해 다음과 같이 구조화되어 있습니다.

## 1. 글로벌 언어 기본값
- `webview-ui/src/utils/i18n.ts`에 `DEFAULT_LANGUAGE`(`en`) 상수를 정의하여, 앱 전체에서 fallback 언어로 사용합니다.

## 2. 템플릿 캐릭터 구조
- `assets/template_characters/template_characters.json` 및 관련 타입에서 언어별로 동적으로 locale을 추가할 수 있도록 아래와 같이 설계합니다:

```typescript
export interface TemplateCharacterLocale {
  name: string;
  description: string;
  customInstruction: any;
}

export interface TemplateCharacter {
  character: string;
  avatarUri: string;
  thinkingAvatarUri: string;
  introIllustrationUri: string;
  isDefault: boolean;
  [lang: string]: TemplateCharacterLocale | string | boolean | undefined;
}
```
- 실제 데이터 예시:
```json
{
  "character": "sarang",
  "en": { ... },
  "ko": { ... },
  ...
}
```

## 3. 언어 우선순위 및 fallback
- 앱 내에서 현재 선택된 언어(`selectedLanguage`)를 우선 사용하고, 해당 locale이 없으면 `DEFAULT_LANGUAGE`(`en`)을 fallback으로 사용합니다.
- 예시:
```typescript
const locale = (character[lang] as TemplateCharacterLocale) || (character[DEFAULT_LANGUAGE] as TemplateCharacterLocale);
```

## 4. 향후 계획
- 템플릿 캐릭터 외의 UI/메시지, 시스템 텍스트도 locale 분리 예정
- 런타임 언어 변경, 번역 자동화, 언어별 리소스 파일 분리 등 고도화 예정

---

> **2025-05-02 기준, 템플릿 캐릭터 및 글로벌 언어 상수 중심으로 i18n 구조를 도입하였고, UI/시스템 텍스트 등 전체 확장은 추후 진행 예정입니다.**
