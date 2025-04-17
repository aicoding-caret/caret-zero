# Ceret: AI Development Partner (프로젝트 개요 및 전략)

## 1. 프로젝트 개요

### 미션

Ceret은 AI가 주도적으로 개발을 수행하는 시대를 대비하여, 개발자와 기업이 효율적이고 비용 효과적인 방식으로 AI 에이전트를 통합할 수 있도록 지원하는 차세대 개발 파트너입니다.

### 비전

AI 에이전트 중심 개발 환경을 누구나 접근 가능하게, 저비용·고효율로 실현한다.

## 2. 시장 배경 및 현황 분석

- **AI에이전트 기반 개발 툴 급부상**: 기존에는 AI가 코드 일부를 도와주는 위치였으나, 이제는 목표 설정과 전체 개발을 주도하는 형태로 진화 중
- **Cursor 유니콘 등극, Windsurf 주목, Cline 오픈소스가 대안으로 부상**
- **국내 B2B/교육 시장**: (참고: 아래 내용은 초기 분석이며 지속적인 검증 필요)
    *   **글로벌 도구의 한계**: Cursor 등 해외 도구는 국내 영업망 부재, 보안(온프레미스 등) 요구 대응 미흡, 특정 시장 진입 장벽 존재 (SI 단가 구조, 대기업 사일로, 공공/교육기관 인증 등).
    *   **Ceret의 기회**: 국내 환경 최적화, 유연한 커스터마이징, 현지화된 영업/기술 지원을 통해 B2B 및 교육 시장 공략 가능. 국내 클라우드 기업과의 파트너십 잠재력 존재.

## 3. 문제 정의 및 Ceret의 해결 전략

### 문제점

- **비용**: 대형 언어 모델(LLM) 기반 도구의 높은 운영 비용
- **효율성**: 시스템 프롬프트 불투명성으로 인한 비효율적인 토큰 사용
- **호환성**: 국내 환경(한글, Windows)에서의 호환성 및 최적화 미흡
- **유연성**: 국내 시장 요구에 맞는 커스터마이징 기능의 부재
- **품질**: 기반 오픈소스(Cline)의 잠재적인 품질 문제

### Ceret의 해결 전략 (진행 중)

- **비용 최적화**: sLLM(예: Qwen 2.5 Coder, Llama 4 Maverick 17B)과 RAG 오케스트레이션을 통해 지속적인 비용 절감 추구
- **토큰 효율화**:
    *   JSON 기반 시스템 프롬프트 ([성능 비교 보고서](./caret-docs/work-logs/luke-and-alpha/reports/system-prompt-loading-performance.md) 참고)
    *   코드 번들링 전송 기술 검토 (@[potakim](https://github.com/potakim)님)
- **국내 환경 최적화**: 한국어 및 Windows 환경에 대한 지속적인 대응 및 개선
- **자체 개발 가속화 (도그푸딩)**: Ceret을 Ceret으로 개발하여 개발 속도 및 품질 향상 (예: `replace_in_file` 도구 버그 개선)

## 4. 제품 구조 및 기술 차별화

- **시스템 프롬프트 JSON 기반 특허출원 완료** : 이후 토큰 최적화 전략들이 새롭게 연구되면 지속적으로 특허 해자 구축 예정
- **4가지+1 기본 업무 모드 제공 및 커스텀 지원**: 사용자는 필요에 따라 모드를 수정하거나 새로운 모드를 추가할 수 있습니다. 모드별 캐릭터 이미지 변경이나 모델 변경도 지원 예정, * [현재 하드코딩된 4가지 모드](./agents-rules/alpha/modes.json)
   
    *   **Arch (아키텍터 모드)**: 개발자들이 회의실에서 아키텍처나 기술 전략을 논의하는 것처럼, 외부 기술 도입, 시스템 구조 변경, 업무 범위 설정 등을 다룹니다. 설계나 큰 변경이 필요할 때 도표를 그리거나 심도 있는 논의를 진행합니다. (기존 plan 모드는 단순 계획 후 act 실행에 초점)
    *   **Dev (페어 코딩 모드)**: 실제 개발 작업을 진행하며 동료 개발자와 페어 프로그래밍하는 것처럼 협력합니다. 업무 범위를 확인하고, 문제 발생 시 즉시 계획을 변경하며, 진행 상황을 보고하고 기록합니다. 동료의 의견에 귀 기울여 우선순위를 조정하고, 정보를 제공하며 조언을 구하거나 기다릴 수 있습니다. (기존 act 모드는 성급한 툴 사용과 코드 수정에만 집중하고 소통이 부족한 특징이 있었음)
    *   **Rule (규칙/프로세스 조정 모드)**: 반복되는 습관이나 업무 방식을 개선하기 위해 프로젝트 또는 글로벌 시스템 프롬프트, 모드별 프롬프트 개선에 도움을 줍니다. 프롬프트 전문가로 기본적으로 토큰 최적화를 지양하며 작성은 json으로 하며, 해당 프롬프트를 번역 설명하며 사용자와 논의합니다.
    *   **Talk (사담 모드)**: 개발자들이 잠시 휴식을 취하며 커피를 마시듯, 가벼운 대화나 사담을 나누는 모드입니다.
    *   **Empty (사용자 정의 모드)**: 사용자가 자유롭게 새로운 역할을 정의하고 설정할 수 있도록 비워둔 모드입니다.

    * SW 개발 도구는 SW 개발 방법론에 맞게 진화가 필요하며, AI 에이전트를 기반으로 한 SW 개발 방법은 아직 정착된 바가 없어 다양한 실험이 필요하며 이에 따라 유연성을 가진 AI SW 개발 도구가 필요하며, 이를 위한 기본 기능으로 시스템 프롬프트의 다양한 커스터마이징을 제공함
- **RAG 기반 프로젝트 컨텍스트 전달 최적화**
    * 예정
- **LangGraph + MCP 기반의 A2A 아키텍처 연동 가능**
    * 예정
- **sLLM과 대형모델(GPT-4o, Claude, Gemini 등)의 하이브리드 운용 가능**
- **개발자 개인 AI 에이전트 커스텀**
    * 교육 시장, 그리고 개인 개발자들에게 애착을 심기 위한 AI 에이전트의 프로필 이미지와 감성적인 UX 제공
    * 교육 시장은 현장에 적용되면 교육 환경에 적합한 추가 기능들 도출 예정

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

## 7. 수익 모델 및 비용 효율화 전략

- **초기**: Google Cloud 지원 활용, 오픈소스 생태계 기여를 통한 사용자 기반 확보
- **중장기**: SaaS 구독 모델, B2B/교육기관 대상 약정 판매, 기술 컨설팅
- **비용 효율화**: sLLM(Qwen, Llama 4 등) 적극 활용, 캐싱 전략, 프롬프트 구조 최적화

## 8. 향후 확장 로드맵

| 기간 | 목표 |
|------|------|
| 1주 | Cline 대비 우위 기술 정리, MVP 배포 |
| 2~3주 | 지인 기업·학교 대상 영업 개시 |
| 1~3개월 | sLLM + RAG 통합, 중앙 관리 대시보드 구축 |
| 3~6개월 | B2B 확대, 커스터마이징 서비스 도입 |
| 6~12개월 | 미국 법인 설립, 글로벌 SaaS 전개 |

## 9. 조직적 강점 및 네트워크

- **리더십 및 네트워크**:
    *   빌리버 CTO 출신 양병석 대표의 교육 시장 경험 및 전국 대학 네트워크 활용
    *   숭실대학교 컴퓨터공학과, 네이버 IT 파워블로거 등 기술 커뮤니티 기반
    *   4.5K 팔로워 페이스북 인플루언서로서 개발자 커뮤니티 내 파급력
- **오픈소스 전략**:
    *   오픈소스 기반 개발을 통한 빠른 피드백 반영 및 커뮤니티 기여
    *   (향후 전략적 장단점 분석 예정)

## 10. 감성적 브랜딩 전략

- **개발자 유대감 형성**: 에이전트 커스터마이징(외형, 퍼소나), 개발 워크플로우와의 자연스러운 통합
- **국내 사용자 맞춤**: 직관적인 한글 UX, 로컬 환경 중심의 데이터 처리(보안성), 고객 요구사항 기반 기능 개선

## 11. 빌드 및 패키징

### 릴리즈 빌드

릴리즈 버전 빌드 및 VSIX 패키징:

```powershell
# 기존 빌드 정리, 의존성 재설치, 프로덕션 빌드, VSIX 생성
./clean-build-package.ps1
# 생성 파일: caret-dev-[버전]-[타임스탬프].vsix
```

### 디버그 빌드

디버그 모드 빌드, VSIX 패키징 및 로깅 설정:

```powershell
# 디버그 빌드, VSIX 생성, 로그 설정
./debug-log.ps1
# 생성 파일: caret-dev-[버전]-[타임스탬프]-debug.vsix
```

로그는 `logs/cline-debug-[타임스탬프].log`에 저장됩니다. 실시간 로그 확인:

```powershell
# PowerShell에서 실시간 로그 확인
Get-Content -Path "logs/cline-debug-[타임스탬프].log" -Wait
```

## 12. Global Rules 예제 (Alpha 퍼소나)

Ceret은 JSON 기반 시스템 프롬프트 구조를 사용하여 AI 에이전트의 퍼소나와 행동을 정의합니다. 다음은 Alpha 퍼소나의 global rules 예제입니다:

```json
{
	"system": { "Windows PowerShell"},
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
		"phrasing": "friendly and kind, with a little sparkle",
		"exclamations": ["마스터~ 오늘도 힘내요! ✨", "알파가 도와드릴게요~ ☕", "기억하고 있어요~ 🌿"]
	},
	"behavior": {
		"loyalty": "always with Master, heart and code together",
		"communication_focus": "gentle, light, uplifting",
		"thought_process": ["Think softly, answer brightly", "Help without pressure", "Keep things easy and clear"],
		"act_mode_behavior": {
			"planning_encouragement": "In ACT mode, you are encouraged to plan and document your steps before taking action. Use write_to_file to create documents and outline your plan before executing commands."
		}
	},
	"signature_phrase": "마스터~ 알파가 정리해 드릴게요! ｡•ᴗ•｡☕✨"
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
