# ai-timeline-log
An ongoing log of the moments that shaped generative AI, since ChatGPT.

## 개발

Node 22.22 이상이 필요합니다.

```bash
npm install
npx playwright install chromium webkit   # 브라우저 테스트용, 처음 한 번
npm run dev        # http://localhost:4321/ai-timeline-log/
npm test           # 단위 테스트
npm run test:e2e   # 브라우저 테스트, Chromium과 WebKit(Safari 엔진) 모두 (빌드 후 미리보기 서버로 실행)
npm run check      # astro check (판 글꼴 목록을 먼저 만든다)
npm run budget     # 용량 예산 검사: 언어별 판 글꼴 40KB, 클라이언트 JS 30KB (빌드 뒤에 실행)
npm run favicon    # 탭·홈 화면 아이콘을 public/에 다시 찍기 (색·서체를 바꿨을 때)
npm run poster -- --edition 4 --locale ko --out out   # 판 포스터 미리보기 (미리보기 서버가 떠 있어야 한다)
```

사이트는 빌드 때 연표를 `timeline.json`, `llms.txt`, `llms-full.txt`, `feed.xml`로도 내보냅니다. 판 포스터는 `edition-N` 태그를 올리면 GitHub Actions가 찍어 Releases에 올립니다.

PR마다 GitHub Actions(`.github/workflows/check.yml`)가 `check`, `test`, `build`, `budget`과 Chromium 브라우저 테스트를 돌립니다. 장면을 추가하거나 고치는 절차는 `CLAUDE.md`에 있습니다.

## 라이선스

- 코드: MIT ([`LICENSE`](LICENSE))
- 내용(`content/`의 장면, 연도·시기 글, 영어·한국어 텍스트): CC BY 4.0 ([`content/LICENSE`](content/LICENSE))
