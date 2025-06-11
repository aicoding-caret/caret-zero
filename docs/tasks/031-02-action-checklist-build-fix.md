# Task #031: 오버레이 아키텍처 빌드 설정 최종 수정 - 액션 체크리스트

> **참고**: [031-01-plan-overlay-architecture-build-fix.md](./031-01-plan-overlay-architecture-build-fix.md)

## 🎯 **목표**: 5분 안에 오버레이 아키텍처 빌드 완성

---

## ✅ **체크리스트**

### **Step 1: tsconfig.json 수정** ⏱️ 2분
- [ ] `caret/tsconfig.json` 파일 열기
- [ ] **수정**: `exclude`에서 `"../src/**/*"` 제거 (paths는 정상이므로 유지)
- [ ] 파일 저장

### **Step 2: base-controller.ts 수정** ⏱️ 1분  
- [ ] `caret/backend/controllers/base-controller.ts` 파일 열기
- [ ] **삭제**: 자체 정의한 interface들 (ExtensionMessage, WebviewMessage)
- [ ] **추가**: `import { ExtensionMessage, WebviewMessage } from "../../../src/shared/types"`
- [ ] 파일 저장

### **Step 3: persona-controller.ts 수정** ⏱️ 1분
- [ ] `caret/backend/controllers/persona-controller.ts` 파일 열기  
- [ ] **수정**: import 경로 확인 및 타입 추가
- [ ] 파일 저장

### **Step 4: 빌드 테스트** ⏱️ 1분
- [ ] 터미널에서 `npm run build:caret` 실행
- [ ] **결과**: 0 errors 확인
- [ ] `npm run compile` 실행 (선택사항)
- [ ] **결과**: 전체 빌드 성공 확인

---

## 🚨 **오류 발생 시**

### **문제**: 여전히 모듈을 찾을 수 없음
**해결**: 
1. `caret/tsconfig.json`에서 exclude 부분 재확인
2. 경로 오타 확인

### **문제**: 타입 오류
**해결**:
1. `src/shared/types.ts` 파일 존재 확인
2. import 경로 정확성 확인

---

## 🎉 **완료 확인**

### ✅ **성공 기준**
- [ ] `npm run build:caret` → "Found 0 errors"
- [ ] 콘솔에 "Build completed successfully" 메시지
- [ ] `dist/` 폴더에 빌드 결과물 생성

### 📋 **최종 테스트** (선택사항)
- [ ] VSCode에서 F5 키 → 새 창에서 Caret 확장 로드
- [ ] 사이드바에서 Caret 아이콘 확인
- [ ] 기본 채팅 기능 테스트

---

## 📁 **수정 대상 파일들**

```
caret-zero/
├── caret/tsconfig.json                           ← 메인 수정
├── caret/backend/controllers/base-controller.ts  ← import 수정  
└── caret/backend/controllers/persona-controller.ts ← 타입 확인
```

---

*예상 완료 시간: 5분*  
*난이도: ⭐ (매우 쉬움)* 