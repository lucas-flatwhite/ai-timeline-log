# AI Timeline Log

[English](README.md) | 한국어

ChatGPT가 공개된 2022년 11월 30일부터 생성형 AI의 사건들을 기록합니다. 사건을 날짜순으로 정리하고 출처를 남겨, 무슨 일이 있었는지 읽고 원문을 확인할 수 있습니다.

[한국어로 읽기](https://lucasflatwhite.com/ai-timeline-log/ko/) · [Read in English](https://lucasflatwhite.com/ai-timeline-log/)

## 담고 있는 것

- 흑백 목판화 상자를 최신순으로 늘어놓은 벽입니다. 상자를 열면 사건의 내용과 출처를 읽을 수 있고, 주제별로 여러 장면을 이어 볼 수 있습니다.
- 같은 사실을 바탕으로 영어판과 한국어판을 함께 씁니다. 사실을 고친 경우에는 해당 장면에 정정 기록을 남깁니다.
- [Releases](https://github.com/lucas-flatwhite/ai-timeline-log/releases)에서 판별 인쇄용 포스터를 받을 수 있습니다. 다른 곳에서도 읽을 수 있도록 JSON, RSS, 일반 텍스트로 내보냅니다.

생성형 AI의 흐름을 바꾼 사건을 골라 기록합니다. 날짜와 사실은 각 사의 발표문, 논문 등 1차 출처로 확인합니다. 틀린 곳이나 빠진 사건을 발견하면 근거와 함께 [이슈로 알려 주세요](https://github.com/lucas-flatwhite/ai-timeline-log/issues/new/choose).

## 계보 스킬

`ai-lineage`는 따로 설치하는 에이전트 스킬입니다. AI 기법이 어디서 나왔는지 조사해, 출처가 붙은 계보 그림(PNG, SVG, PDF, Mermaid, 출처 목록)을 그립니다. 모든 상자에 출처가 붙고, 에이전트가 출처를 하나도 열지 못한 상자는 "확인 못 함"으로 표시합니다.

```bash
npx skills add lucas-flatwhite/ai-timeline-log --skill ai-lineage -g
```

자세한 내용은 [`skills/ai-lineage`](skills/ai-lineage)에 있습니다.

## 로컬에서 실행하기

Astro와 TypeScript로 만들었으며, 장면은 YAML로 저장합니다. Node.js 22.22 이상이 필요합니다.

```sh
npm install
npm run dev          # http://localhost:4321/ai-timeline-log/
```

```sh
npm run check
npm test
npm run build
npm run budget
npx playwright install chromium webkit
npm run test:e2e
```

영어판은 `/ai-timeline-log/`, 한국어판은 `/ai-timeline-log/ko/`에 있습니다. 사이트에서 고른 언어는 브라우저에 기억됩니다. PR마다 GitHub Actions가 검사와 브라우저 테스트를 실행합니다. 콘텐츠 편집, 정정, 리서치 방법은 [AGENTS.md](AGENTS.md)에, 포스터와 그림 절차는 `.agents/skills/`에 정리했습니다.

## 라이선스

코드: [MIT](LICENSE). `content/`의 연표 콘텐츠: [CC BY 4.0](content/LICENSE).
