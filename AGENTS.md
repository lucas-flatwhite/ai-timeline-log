# AGENTS.md

이 저장소에서 일하는 에이전트를 위한 규칙입니다. 어떤 에이전트든 이 파일을 기준으로 삼습니다(`CLAUDE.md`는 이 파일을 불러오기만 합니다). 사람이 읽는 개요는 `README.md`에 있습니다.

## 작업별로 먼저 읽을 파일

이 파일에는 늘 지켜야 하는 규칙만 둡니다. 아래 일을 할 때는 해당 파일을 먼저 엽니다. 스킬을 저절로 불러오는 에이전트도 있지만, 그렇지 않더라도 경로를 직접 열면 됩니다.

- 새 사건 리서치, 장면 후보 조사: `.agents/skills/scene-research/SKILL.md`
- 판 기록, 포스터 Release: `.agents/skills/edition-release/SKILL.md`
- 사건 그림(`pic`), `content/pics.yaml`: `.agents/skills/draw-pic/SKILL.md`

스킬 원본은 `.agents/skills/`에 있고, `.claude/skills`는 이 폴더를 가리키는 심볼릭 링크입니다. 고칠 때는 `.agents/skills/`의 파일을 고칩니다.

## 구조

- `content/scenes/<날짜>-<슬러그>.yaml`: 장면 하나가 파일 하나입니다. 파일명은 `date`와 `id`에서 정해집니다(`id`가 `2025-01-deepseek`, `date`가 `2025-01-27`이면 `2025-01-27-deepseek.yaml`).
- `content/years.yaml` 연도 요약, `content/arcs.yaml` 시기 구분, `content/ledger.yaml` 연구소 계보, `content/site.yaml` 사이트 문구와 `asOf`, `content/pics.yaml` 그림 윤곽선, `content/topics.yaml` 주제(여러 장면을 잇는 흐름), `content/editions.yaml` 판 기록.
- 내보내기 파일(`timeline.json`, `llms.txt`, `llms-full.txt`, `ko/llms-full.txt`, `feed.xml`, `ko/feed.xml`)은 빌드가 `src/lib/export.ts`와 `src/lib/feed.ts`로 같은 내용에서 만듭니다. 따로 손대지 않습니다.
- 언어 주소: 영어가 기본이라 `/ai-timeline-log/`에 있고, 한국어는 `/ai-timeline-log/ko/`에 있습니다(`src/i18n/index.ts`의 `locales`, `localePath`). 예전 `en/` 주소는 `vercel.json`(이 저장소와 lucasflatwhite-com 둘 다)이 영구 이동으로 돌려보냅니다.
- 보여 줄 언어는 고른 언어 → 브라우저의 첫 언어 → 영어 순서입니다. 고른 언어는 브라우저 저장소 `lucas-flatwhite:locale`(`LOCALE_KEY`)에 적고, 사이트 전체(아케이드 게임 포함)가 같은 키를 씁니다. 언어 링크를 누를 때만 적고(브라우저 언어로 보여 준 것은 적지 않습니다), 기본 주소로 들어왔을 때만 옮깁니다. `ko/`를 직접 열면 저장된 값과 상관없이 한국어입니다(`src/layouts/Page.astro`의 인라인 스크립트, `tests/e2e/lang.spec.ts`). 브라우저 테스트는 `en-US` 브라우저로 돕니다(`playwright.config.ts`).
- 사실(날짜, 수치, 판화 설정, 출처)은 한 번만 적고 글만 `ko`/`en`으로 나란히 둡니다.
- 스키마는 `src/lib/schema.ts`, 빌드 검사는 `src/lib/checks.ts`입니다. 오류는 빌드를 멈추고 경고는 출력만 합니다.
- 장면 색인: `npm run index`는 장면마다 한 줄(날짜, id, 사건 수, 주제, 영어 제목)을 보여 줍니다. `--items`는 사건 문장 앞부분까지, `--since YYYY-MM`은 그 뒤 장면만, `--grep 낱말`은 장면과 용어집(`content/glossary.yaml`)에서 찾습니다. 중복이나 용어를 확인할 때 YAML을 하나씩 열거나 용어집을 통째로 읽지 말고 이것부터 씁니다.
- 리서치 메모: `docs/review/<날짜>-<슬러그>.md`. 쓰는 양식은 `scene-research` 스킬에 있습니다.

## 장면 추가·정정 절차

1. **리서치**: 무슨 일이 언제 있었는지 찾습니다. 장면 선정 기준은 "흐름을 바꾼 사건"입니다. 연도별 분량을 맞추려고 넣지 않습니다. 방법과 메모 양식은 `.agents/skills/scene-research/SKILL.md`에 있습니다.
2. **출처 확인**: 1차 출처(각 사 발표, 논문, 소송 문서)를 먼저 확인하고 언론 보도는 보완으로 씁니다. 진행 중인 사건은 "보도 기준"임을 글에 밝히고, 민감한 사안은 양쪽 입장만 적습니다. 첫 판(`firstEdition`) 이후 추가하는 장면은 출처가 하나 이상 있어야 합니다.
3. **ko·en 작성**: 한국어와 영어를 함께 씁니다. 영어는 아래 "영어 문장 원칙"을 따릅니다.
4. **주제 달기**: 장면에 `topics: [..]`를 하나 이상 답니다(`content/topics.yaml`의 id). 모르는 id는 빌드 오류, 주제가 없는 장면은 경고입니다. 새 주제는 장면이 3개 이상일 때만 만듭니다.
5. **해당 연도 요약 다시 읽기**: `content/years.yaml`의 그 연도 요약(`ko`, `en`)이 새 장면과 맞는지 다시 읽고, 어긋나면 고칩니다. 장면이 있는 연도에는 연도 요약이 반드시 있어야 합니다.
6. **`asOf` 갱신**: `content/site.yaml`의 `asOf`를 작업한 날로 바꿉니다. `date`, 사건 날짜, `added`는 `asOf`보다 늦을 수 없습니다. 새 장면의 `added`는 작업한 날이고, 고친 장면에는 `updated`를 적습니다.
7. **검사·테스트**: 아래 "검사 명령"을 모두 돌립니다.
8. **PR**: 브랜치를 따서 PR을 엽니다. 본문에 바뀐 장면과 근거 링크를 적습니다. 직접 `main`에 올리지 않습니다.

### 판 기록과 포스터

판을 찍고 포스터 Release를 올리는 절차는 `.agents/skills/edition-release/SKILL.md`에 있습니다. 요점: `main`에 머지하면 바로 배포되므로 **Release를 먼저 만들고 머지합니다.**

### 정정

- 사실 정정(날짜, 수치, 주체)은 장면의 `corrections`에 `{ date, ko, en }`으로 남깁니다. 오타는 조용히 고칩니다.
- 사실이 바뀌면 장면의 `updated`를 갱신하고, 고친 근거를 `sources`에 더합니다.
- `id`는 주소라서 바꾸지 않습니다. 부득이하게 바꾸면 예전 `id`를 `aliases`에 둡니다.
- 정정 제보는 GitHub 이슈 양식(`.github/ISSUE_TEMPLATE/correction.yml`)으로 들어옵니다. 근거를 확인한 뒤에만 고칩니다.

## 사건 `glyph` (상자에 새기는 핵심어)

모든 사건(`items[]`)에 `glyph`가 필요합니다.

- 사건 상자는 1×1 작은 판입니다. **한국어는 한 줄에 한글 3자 이내**로 씁니다. 4자 이상이거나 라틴 8자 이상이면 빌드가 경고합니다(작은 판에서 흐려집니다). 줄바꿈 `\n`으로 두 줄로 나눌 수 있습니다.
- **숫자와 이름**(`GPT-6`, `6개월`, `-17%`)은 두 언어에서 같으므로 문자열 하나로 적습니다.
- 그 밖에는 `{ ko, en }`으로 둘 다 적습니다. 예: `glyph: { ko: 침입, en: BREACH }`.
- 영어 핵심어에 한글이 들어 있으면 빌드 오류입니다(번역 누락 방지).
- 장면의 `print.glyph`는 공용 핵심어이고, 언어별로 다르면 `en.glyph`를 둡니다.

## `pic` (그림 상자)

사건에 그림을 붙이거나 `content/pics.yaml`에 윤곽선을 그릴 때는 `.agents/skills/draw-pic/SKILL.md`를 먼저 읽습니다. 그림은 일부 사건(10~20개 안팎)에만 쓰고, 로고·상표·실존 인물의 얼굴은 그리지 않습니다.

## 영어 문장 원칙

- 공식 영문명은 1차 출처(발표문, 공식 사이트)에서 확인해 `content/glossary.yaml`에 적고 그대로 씁니다. 같은 대상을 다르게 쓰지 않습니다. 용어집에 없는 이름은 출처를 확인해 먼저 용어집에 더합니다.
- 한국어를 직역하지 않고 영어로 자연스럽게 읽히는 문장으로 씁니다. 사건 문장은 한 문장, 현재형으로 씁니다(예: "OpenAI discloses that …").
- 금지어(아래)와 상대 시간 표현은 영어에도 적용됩니다.

## 문체 규칙 (빌드가 검사합니다)

- 금지어: 한국어 `놀라운`, `혁명적`, `게임 체인저` / 영어 `revolutionary`, `game-changer`, `groundbreaking`, `stunning`, `incredible` / 공통 `!`, 이모지.
- **em dash(U+2014)는 어디에도 쓰지 않습니다. 예외가 없습니다.** 한국어·영어 글, 화면 문구(`src/i18n/`), 출처 제목, YAML 주석, 코드 주석, 테스트, 커밋 메시지, PR 본문까지 해당합니다. 원문 기사 제목에 있으면 쉼표나 쌍점(`:`)으로 바꿔 옮깁니다. 글에서는 마침표로 문장을 나누거나 쉼표·쌍점·괄호를 씁니다. 빌드는 콘텐츠의 모든 문자열(출처 제목 포함)에서 오류로 막고, 단위 테스트(`tests/unit/no-em-dash.test.ts`)가 저장소의 글 파일 전체를 검사합니다. 날짜 범위의 en dash(`–`)는 그대로 씁니다.
- 상대 시간 표현은 장면·사건·연도·시기 글에서 쓰지 않습니다: 한국어 `오늘`, `최근`, `올해`, `현재` / 영어 `today`, `recently`, `this year`. 읽는 날에 따라 뜻이 달라지기 때문입니다.
- 사건은 장면마다 3~4개입니다.

### AI가 쓴 것처럼 읽히는 표현 (빌드가 잡지 못하니 직접 봅니다)

사실을 짧게 적고, 의미를 덧붙여 해설하지 않습니다. 아래 표현이 보이면 사실 문장으로 바꿉니다.

- 한국어: `~하는 일이 중요해졌다`, `~이 과제가 됐다`, `서로 다른 길을 제시했다`, `~의 경계를 정했다`, `~로 이어졌다`(인과를 꾸밀 때), `폭발적으로`, `세상을 놀라게 한`, `새로운 장을 열었다`, `패러다임`, `~에 그치지 않고`.
- 영어: `became essential`, `became a pressing task`, `offering different ways to`, `extended to`, `marks a turning point`, `a new era`, `landscape`, `paradigm`, `underscores`, `highlights`, `delve`, `pivotal`, `In a world where`, `X Meets Y` 꼴의 제목.
- 문장 끝에 분사구를 줄줄이 다는 꼴(`…, enabling …, describing …, noting …`). 사건 문장은 한 문장이지만 절을 서너 개 잇지 않습니다. 길어지면 덜 중요한 사실을 뺍니다.
- 세 가지를 나란히 늘어놓는 수사, 대구로 맞춘 제목(`A의 B, C의 D`)을 반복하지 않습니다.
- `보도 기준`, `진행 중` 같은 단서는 사실이므로 남깁니다. 다만 한 번만, 짧게 씁니다.

## 검사 명령

PR 전에 모두 통과해야 합니다. CI(`.github/workflows/check.yml`)도 같은 순서로 돌고, 브라우저 테스트는 Chromium과 WebKit을 나란히 돌립니다.

```bash
npm run check        # astro check. precheck가 판 글꼴 목록(src/generated/plate.json)을 먼저 만들어 새로 받은 저장소에서도 돈다
npm test             # 단위 테스트(콘텐츠 검사 포함)
npm run build        # 판 글꼴을 만들고 정적 사이트를 빌드. 콘텐츠 오류는 여기서 빌드 실패로 나온다
npm run budget       # 용량 예산: 언어별 판 글꼴 40KB, 클라이언트 JS 30KB(압축 전) 이하
npx playwright test --project=chromium   # 브라우저 테스트(빌드와 미리보기 서버를 알아서 띄운다)
npx playwright test --project=webkit     # Safari 엔진. 마우스로 누른 링크에 초점을 주지 않는 등 Safari에서만 생기는 문제를 잡는다
```

빌드의 경고도 읽습니다. 경고가 늘면 이유를 확인합니다.

## 하지 않는 것

- 외부 런타임 리소스, 분석 도구, Google Fonts를 넣지 않습니다.
- `src/generated/`, `public/plate/`는 빌드가 만드는 파일이라 커밋하지 않습니다.
- 공유 이미지(`public/og/`)는 내용이 크게 바뀌면 `scripts/og.ts`로 다시 찍어 커밋합니다.
- 포스터 파일은 커밋하지 않고 사이트에도 두지 않습니다. GitHub Releases에만 올립니다(Vercel 비용을 지지 않기 위해서).
- 방문자 정보를 서버로 보내지 않습니다. "지난 방문 이후 새 상자"는 브라우저 저장소(`atl:seen`, `atl:since`)만, 고른 언어는 `lucas-flatwhite:locale`만 씁니다.

## 라이선스

코드는 MIT(루트 `LICENSE`), 내용(`content/`)은 CC BY 4.0(`content/LICENSE`)입니다.
