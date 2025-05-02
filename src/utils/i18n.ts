// 글로벌 다국어/국제화 유틸

import * as vscode from 'vscode';

export const DEFAULT_LANGUAGE = "en" as const;

/**
 * VSCode 언어 설정에서 현재 언어를 가져옵니다.
 * @returns 언어 코드 (예: 'ko', 'en' 등)
 */
export function getCurrentLanguage(): string {
  // VSCode 언어 설정에서 가져옵니다. (기본값 'ko')
  const vscodeLocale = vscode.env.language || 'ko';
  // 언어 코드에서 지역 정보를 제거합니다. (예: ko-KR -> ko)
  return vscodeLocale.split('-')[0];
}

/**
 * 다국어 데이터에서 특정 언어의 데이터를 가져옵니다.
 * @param data 다국어 데이터
 * @param lang 언어 코드
 * @returns 해당 언어의 데이터
 */
export function getLocalizedData(data: Record<string, any>, lang: string): any {
  // 언어 코드에 해당하는 데이터를 가져옵니다. 없으면 기본 언어 데이터를 가져옵니다.
  return data[lang] ?? data[DEFAULT_LANGUAGE] ?? {};
}
