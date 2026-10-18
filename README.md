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
```

`reference/original/`은 처음 아티팩트로 만든 한 파일 버전입니다. 구조를 바꾼 뒤 원본과 같은지 비교하는 기준으로만 쓰고, 배포에는 포함되지 않습니다.
