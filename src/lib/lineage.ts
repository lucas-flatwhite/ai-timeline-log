import type { Locale } from './dates.ts';
import { ORIGIN } from './origin.ts';

/* 포스터와 데이터 칸의 계보 스킬: 설치 명령, GitHub 링크, 견본 이미지 주소 */
const SKILL = 'ai-lineage';

/** repo는 https://github.com/<소유자>/<저장소> */
export function lineageInstall(repo: string): string {
  return `npx skills add ${new URL(repo).pathname.slice(1)} --skill ${SKILL} -g`;
}

export function lineageLinks(repo: string, locale: Locale): { folder: string; sample: string } {
  return {
    folder: `${repo}/tree/main/skills/${SKILL}`,
    sample: `${repo}/blob/main/skills/${SKILL}/examples/moe.${locale}.png`,
  };
}

export function lineageImage(locale: Locale): { src: string; w: 1200; h: 675 } {
  return { src: `${new URL(ORIGIN).pathname}lineage/${SKILL}-${locale}.avif`, w: 1200, h: 675 };
}
