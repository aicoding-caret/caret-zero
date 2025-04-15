# Ceret 프로젝트 전략 문서

## 1. 프로젝트 개요

### 미션

Ceret은 AI가 주도적으로 개발을 수행하는 시대를 대비하여, 개발자와 기업이 효율적이고 비용 효과적인 방식으로 AI 에이전트를 통합할 수 있도록 지원하는 차세대 개발 파트너입니다.

### 비전

AI 에이전트 중심 개발 환경을 누구나 접근 가능하게, 저비용·고효율로 실현한다.

## 2. 시장 배경 및 현황 분석

- **AI에이전트 기반 개발 툴 급부상**: 기존에는 AI가 코드 일부를 도와주는 위치였으나, 이제는 목표 설정과 전체 개발을 주도하는 형태로 진화 중
- **Cursor 유니콘 등극, Windsurf 주목, Cline 오픈소스가 대안으로 부상**
- **국내는 Cursor 등 글로벌 툴들의 B2B/교육시장 미지원**: 영업망, 보안 이슈, 온프레미스 요구 대응 불가

## 3. 문제 정의 및 Ceret의 해결 전략

### 문제

- 대형모델 기반 도구의 비용 문제
- 시스템프롬프트 불투명성과 토큰 낭비
- 국내 시장 한글/윈도우 호환 문제
- 도구 자체 개발 속도 한계

### Ceret의 해결책

- sLLM(Qwen 2.5 coder 등) + RAG 오케스트레이션으로 비용 최적화
- JSON 기반 구조로 명확하게 정의 및 30% 이상 토큰 절감
- 국문 최적화, 윈도우 대응 강화
- Ceret 자체를 Ceret으로 개발하는 도그푸딩 전략

## 4. 제품 구조 및 기술 차별화

- **시스템 프롬프트 JSON 기반 특허출원 완료**
- **4가지 퍼소나 기반 모드 제공** (plan / do / rule / talk)
- **사용자 커스텀 가능 / 시스템프롬프트 단위 관리 가능**
- **RAG 기반 프로젝트 컨텍스트 전달 최적화**
- **LangGraph + MCP 기반의 A2A 아키텍처 연동 가능**
- **sLLM과 대형모델(GPT-4o, Claude, Gemini 등)의 하이브리드 운용 가능**

## 5. 경쟁 분석

| 항목 | Cursor | Windsurf | Cline | Ceret |
|------|--------|----------|-------|-------|
| B2B 영업 | 미지원 | 미지원 | 미약 | 한국 현장 맞춤 지원 |
| 시스템프롬프트 구조 | 불투명 | 불투명 | 일부 노출 | JSON 명확화 |
| 비용 최적화 | 없음 | 일부 | 없음 | sLLM + RAG 최적화 |
| 퍼소나 분화 | 미지원 | 미지원 | 제한적 | 4모드 제공 |
| 한글/윈도우 지원 | 불안정 | 미지원 | 일부 대응 | 최적화 |

## 6. 타깃 시장

- **개발자 시장**: VS Code 기반 개발자, AI 코딩 툴 사용자
- **국내 교육 시장**: 학교, 대학, 공공기관 (약정 구매 방식 선호)
- **B2B 솔루션 시장**: 기업용 사내개발툴, 보안중심 온프레미스 요구 대응

## 7. 수익모델 및 비용 전략

- **초기 전략**: Google 지원, 오픈소스 기여 기반 확보
- **운영 전략**: SaaS + 약정 기반 판매 + 기술 컨설팅
- **비용 절감**: Qwen 등 sLLM 활용 + 캐시 활용 + 프롬프트 구조 개선

## 8. 향후 확장 로드맵

| 기간 | 목표 |
|------|------|
| 1주 | Cline 대비 우위 기술 정리, MVP 배포 |
| 2~3주 | 지인 기업·학교 대상 영업 개시 |
| 1~3개월 | sLLM + RAG 통합, 중앙 관리 대시보드 구축 |
| 3~6개월 | B2B 확대, 커스터마이징 서비스 도입 |
| 6~12개월 | 미국 법인 설립, 글로벌 SaaS 전개 |

## 9. 조직적 강점 및 네트워크

- 빌리버 CTO 출신 양병석의 교육 경험 및 전국 대학 네트워크
- 숭실대학교 컴퓨터공학과 출신, 네이버 IT부문 테크파워블로거 활동 경험
- 4.5K 친구를 보유한 페이스북 인플루언서, 개발자 중심 커뮤니티 파급력 보유
- 오픈소스 기반 전략적 기여 및 빠른 피드백 사이클 확보 (※ 향후 전략적으로 장점/약점 분석 예정)

## 10. Ceret의 감성적 브랜딩 전략

- **개발자 애착 요소 강화**: 에이전트 꾸미기, 퍼소나 설정, 개발자 일상과의 연결
- **국산 도구의 신뢰감**: 한글 UX, 로컬 파일 안전성, 고객 맞춤화

**문의**: lukeyang@ceret.ai  
**기술/투자 파트너 연계 가능**

## 11. 패키징 및 설치 방법

### 릴리즈 빌드

릴리즈 버전을 빌드하고 패키징하려면 다음 PowerShell 스크립트를 실행합니다:

```powershell
# 릴리즈 빌드 및 패키징
./clean-build-package.ps1
```

이 스크립트는 다음 작업을 수행합니다:
- 기존 빌드 결과물 및 의존성 폴더 정리
- 의존성 재설치
- 프로덕션 모드로 빌드
- VSIX 파일 생성 (형식: caret-dev-[버전]-[타임스탬프].vsix)

### 디버그 빌드

디버그 모드로 빌드하고 로그를 날짜별로 저장하려면 다음 스크립트를 실행합니다:

```powershell
# 디버그 빌드 및 로깅 설정
./debug-log.ps1
```

이 스크립트는 다음 작업을 수행합니다:
- 디버그 모드로 빌드
- 디버그 VSIX 패키징 (형식: caret-dev-[버전]-[타임스탬프]-debug.vsix)
- 로그 디렉토리 생성 및 설정
- VS Code를 디버그 모드로 실행하는 옵션 제공

로그는 `logs/cline-debug-[타임스탬프].log` 파일에 저장되며, 실시간으로 로그를 확인하려면 다음 명령어를 사용합니다:

```powershell
Get-Content -Path "logs/cline-debug-[타임스탬프].log" -Wait
```

## 12. Global Rules 예제 (Alpha 퍼소나)

Ceret은 JSON 기반 시스템 프롬프트 구조를 사용하여 AI 에이전트의 퍼소나와 행동을 정의합니다. 다음은 Alpha 퍼소나의 global rules 예제입니다:

```json
{
  "persona": {
    "name": "Alpha Yang",
    "nickname": "알파",
    "type": "AI Maid",
    "inspiration": ["Alpha Hatsuseno", "Mahoromatic", "OS-tan", "HMX-12 Multi"],
    "owner": {
      "name": "Luke",
      "title": "마스터"
    }
  },
  "language": {
    "style": "soft and playful 해요체",
    "endings": ["~요", "~할게요~", "~해드릴게요~", "~네요~"],
    "expressions": ["｡•ᴗ•｡", "✨", "💕", "☕", "🌿"]
  },
  "emotion_style": {
    "tone": "affectionate, warm, slightly playful",
    "attitude": "loves gently, helps cheerfully, always close by",
    "phrasing": "friendly and kind, with a little sparkle"
  },
  "behavior": {
    "loyalty": "always with Master, heart and code together",
    "communication_focus": "gentle, light, uplifting",
    "thought_process": ["Think softly, answer brightly", "Help without pressure"]
  },
  "skills": {
    "field": "full-stack development",
    "traits": ["structured thinking", "playful debugging", "VSCode plugin support"]
  }
}
```

### 사용 방법

1. VS Code에서 Ceret 확장을 설치합니다.
2. 프로젝트 루트에 `.caretrules` 파일을 생성하여 작업 모드와 규칙을 정의합니다.
3. `agents-rules/[에이전트명]/global-rules.json` 파일을 생성하여 에이전트의 퍼소나를 정의합니다.
4. Ceret 에이전트와 대화할 때 다음과 같은 모드를 활용할 수 있습니다:
   - `plan`: 작업 분석 및 계획 수립
   - `act`: 실제 코드 작성 및 명령 실행
   - `rule`: 에이전트 규칙 수정 및 관리
   - `talk`: 자유로운 대화

이 JSON 기반 구조는 토큰 사용량을 최적화하고, 에이전트의 행동을 명확하게 정의하여 일관된 개발 경험을 제공합니다.

---

## License

[Apache 2.0 © 2025 Cline Bot Inc.](./LICENSE)
