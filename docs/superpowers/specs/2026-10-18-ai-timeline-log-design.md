# 생성형 AI 목판 연표 — 구조 재설계 스펙

- 작성일: 2026-10-18
- 출발점: claude.ai 아티팩트로 만들고 검증한 `ai-1405.zip`(index.html 한 파일)과 `ai-timeline-prompt.md`
- 상태: 리뷰 대기

## 1. 목적

ChatGPT 공개(2022-11-30)부터 기준일까지 생성형 AI의 주요 장면을 흑백 목판화 스타일의 스크롤 연표로 보여 준다. 이번 작업의 목표는 이미 검증된 내용과 디자인을 유지하면서 다음을 가능하게 하는 것이다.

1. **계속 자라는 로그**: 장면을 끝에도, 기존 역사 중간에도 끼워 넣을 수 있다.
2. **다국어**: 한국어(기본)와 영어. 이후 다른 언어를 추가할 수 있는 구조.
3. **유지보수 가능한 구조**: 내용, 스타일, 판화 엔진, 스크롤 제어를 분리한다. 장면 추가가 파일 하나 추가로 끝나고, 실수는 빌드가 잡는다.

## 2. 확정된 결정

| 주제 | 결정 |
| --- | --- |
| 운영 방식 | 계속 자라는 로그. 기준일(`asOf`)을 직접 갱신한다 |
| 스크롤 순서 | 시간순 유지. 중간 삽입 허용 |
| 판 번호 | 화면에서 제거. 위치는 날짜로 표시하고, 합계("판 28장", "장면 5개")만 자동 계산해 남긴다 |
| 장면 주소 | 고정 ID(`#2025-01-deepseek`). 끼워 넣어도 기존 링크가 깨지지 않는다 |
| 최근 추가 | 장면마다 추가일(`added`). 가장 최근 추가 묶음을 표지 바로가기와 목차·설명판 표시로 알린다 |
| 언어 | 모든 언어가 같은 장면 구성. 장면 추가 시 ko·en을 함께 채우고, 누락 시 빌드 실패 |
| 언어 주소 | `/` 한국어, `/en/` 영어. 자동 리다이렉트 없음. 언어 전환 링크 제공 |
| 내비게이션 | 데스크톱 눈금자를 색인으로 확장, 모바일은 상단 표시줄을 눌러 목차 시트 |
| 빌드 | Astro (정적 출력). 내용은 빌드 시 HTML로 렌더링하고 JS는 판화·스크롤만 맡는다 |
| 배포 | GitHub Pages, `https://lucas-flatwhite.github.io/ai-timeline-log/` (base `/ai-timeline-log`) |
| 작품 이름 | 고정: "생성형 AI 목판 연표" / "A Woodcut Timeline of Generative AI"(가안). 일수는 표지·설명·OG 이미지에만 |
| 폰트 | fontsource로 직접 배포(OFL). Google Fonts 의존 제거 |
| 라이선스 | 코드 MIT, 내용(`content/`) CC BY 4.0 |
| 분석 도구 | 넣지 않음 |

## 3. 저장소 구조

```
content/                     내용 (CC BY 4.0, content/LICENSE)
  site.yaml                  시작일, 기준일, 첫 판 기준일, 작품 이름, 표지 문구
  scenes/
    2022-11-30-chatgpt.yaml  장면 하나 = 파일 하나. 파일명 = 대표 날짜 + 슬러그
    ...
  years.yaml                 연도 요약 (연도별 ko/en 제목·본문)
  arcs.yaml                  맺음의 시기 정리
  ledger.yaml                연구소별 모델 계보
  sources.yaml               장면에 묶이지 않는 일반 출처
  changelog.yaml             정정 기록 외의 갱신 메모(선택)
  glossary.yaml              번역 용어집 (공식 영문명과 출처)
src/
  content.config.ts          컬렉션 스키마(zod)와 교차 검사
  i18n/                      UI 문구(ko.ts, en.ts), 날짜·숫자 포맷
  lib/                       일수 계산, 정렬, 최근 추가 계산 등 순수 함수
  components/                Hero, YearPlate, Scene, Outro, Bar, Rail, IndexSheet, LangSwitch
  layouts/Page.astro         head(meta, OG, hreflang, canonical), 폰트, 공통 골격
  pages/index.astro          ko
  pages/en/index.astro       en
  engine/                    판화 엔진 (DOM·프레임워크 무관한 순수 canvas 코드)
    compose.ts               밑그림 → 농도 샘플러
    glyph.ts                 fitGlyph, drawGlyph
    motif.ts                 rays, disc, grid, fall, rise, border, vignette
    engrave.ts               칼선 생성 (Path2D 버킷)
    mount.ts                 canvas 장착, paint, buckets
  client/                    페이지 동작
    main.ts                  초기화, 폰트 대기, 레이아웃
    scenes.ts                고정·먹 입히기·판 찍기/지우기, 지연 생성/해제 큐
    hero.ts                  표지 판화와 햇살 문양
    bar.ts, rail.ts, index-sheet.ts
  styles/                    tokens.css(언어별 서체 토큰 포함), base, hero, year, scene, outro, nav
public/
  .nojekyll, og/ko.png, og/en.png
scripts/
  migrate-original.ts        1회용: 원본 CH/YR/LEDGER → YAML 이관
  og.ts                      빌드된 표지를 Playwright로 찍어 OG 이미지 생성
tests/                       Playwright 테스트, 데이터 검사 단위 테스트
reference/original/          원본 index.html, README, 프롬프트 (비교 기준, 배포 제외)
.github/
  workflows/deploy.yml       빌드·검사·배포
  workflows/check.yml        PR 검사
  ISSUE_TEMPLATE/correction.yml
docs/editorial.md            편집 원칙 (선정 기준, 문체, 금지어, 출처, 정정)
CLAUDE.md                    장면 추가 절차 등 에이전트용 작업 규칙
```

## 4. 데이터 모델

### 4.1 장면 파일

```yaml
# content/scenes/2025-01-27-deepseek.yaml
id: 2025-01-deepseek            # 고정 ID = 주소. 바꾸지 않는다
date: 2025-01-27                # 대표 날짜 (정렬, 눈금자 위치)
span: { from: 2025-01 }         # 설명판의 기간 표시. to 생략 가능
order: 0                        # 같은 날짜 장면의 순서 (선택)
added: 2026-10-05               # 로그에 추가된 날
updated: 2026-10-05             # 내용이 바뀐 날 (선택)
aliases: []                     # 예전 ID (병합·이름 변경 시)
print:
  pattern: h                    # h 가로 | d 사선 | w 물결 | c 동심원
  angle: null                   # d일 때 각도
  motif: fall                   # rays | disc | grid | fall | rise | none
  glyph: "-17%"                 # 공용 핵심어. 언어별 glyph가 있으면 그쪽이 우선
sources:                        # 첫 판 이후 추가 장면은 1개 이상 필수
  - { url: "https://...", title: "...", publisher: "..." }
corrections: []                 # [{ date, ko, en }] 사실관계 정정만
items:
  - date: 2025-01-20            # YYYY-MM-DD 또는 YYYY-MM
    ko: 딥시크, 추론 모델 R1을 MIT 라이선스로 공개.
    en: DeepSeek releases its reasoning model R1 under the MIT license.
  - ...
ko:
  kicker: 충격
  title: 딥시크 쇼크
  lede: 중국의 작은 연구소가 o1급 추론 모델을 가중치까지 공개했다. 미국 증시가 흔들렸다.
en:
  kicker: Shock
  title: The DeepSeek Shock
  lede: ...
  glyph: null                   # 예: 한국어 "지브리" → 영어 "GHIBLI", "1.22" → "JAN 22"
```

사실(날짜, 수치, 판화 설정, 출처)은 한 번만 적고, 글만 언어별로 나란히 둔다. 언어별 파일로 나누면 항목 배열의 순서를 파일 사이에서 맞춰야 해서 깨지기 쉽기 때문이다.

### 4.2 사이트 설정

```yaml
# content/site.yaml
start: 2022-11-30
asOf: 2026-10-05           # 기준일. 갱신할 때 직접 바꾼다
firstEdition: 2026-10-05   # 첫 판의 추가일. 이보다 늦은 added만 "최근 추가"로 취급
ko:
  name: 생성형 AI 목판 연표
  heroGlyph: { wide: "{days}일", tall: "{days}\n일" }
  lede: "ChatGPT가 공개된 {start}부터 {asOf}까지, 생성형 AI가 지나온 장면 {count}개를 판화로 찍었습니다. …"
en:
  name: A Woodcut Timeline of Generative AI
  heroGlyph: { wide: "{days} days", tall: "{days}\ndays" }
  lede: "..."
```

### 4.3 기타 컬렉션

- `years.yaml`: `{ 2023: { ko: { title, body }, en: { title, body } }, ... }`. 장면이 있는 연도에 요약이 없으면 빌드 실패.
- `arcs.yaml`: `[{ from, to, ko: { title, body }, en: {...} }]`.
- `ledger.yaml`: `[{ lab: { ko, en }, models: [{ name, date: YYYY-MM }] }]`. 날짜순 정렬은 빌드가 한다.
- `sources.yaml`: 일반 출처 목록. 페이지 끝 "출처와 기준"은 이 목록과 장면별 출처를 합쳐 중복 없이 만든다.
- `glossary.yaml`: `[{ ko, en, source }]`. 고유명사의 공식 영문명. 검사 대상은 아니고 번역 참고용.

## 5. 계산되는 값

모든 화면 문구에서 직접 적힌 숫자를 없앤다.

| 값 | 계산 |
| --- | --- |
| 일수 | `asOf - start` (날짜 단위). 2026-10-05 기준 1,405 |
| 장면 수 | 장면 파일 수 |
| 연도별 장면 수 | 대표 날짜의 연도로 묶음 |
| 연도 판 위치 | 그해 첫 장면 바로 앞 |
| 눈금자 연도 | 장면이 있는 연도 + 시작·기준일 라벨 |
| 진행선 | 활성 장면의 대표 날짜를 `start..asOf`에 비례 |
| 최근 추가 | `added`의 최댓값이 `firstEdition`보다 늦으면, 그 날짜에 추가된 장면들 |
| 갱신 기록 | `added`(첫 판 제외)와 `corrections`를 날짜 역순으로 |

## 6. 렌더링 원칙

- **모든 글은 정적 HTML**: 장면, 연도 판, 목차, 맺음, 출처가 JS 없이도 다 읽힌다.
- **JS는 DOM을 읽는다**: 판화 설정은 각 섹션의 `data-*` 속성(`data-glyph`, `data-pattern`, `data-angle`, `data-motif`, `data-date`, `data-seed`)으로 넘긴다. JS가 필요한 UI 문구(표시줄 라벨 등)는 페이지당 `<script type="application/json" id="ui">` 하나로 넘긴다.
- **판화 엔진은 텍스트에 의존하지 않는다**: 엔진은 문자열과 서체를 받아 밑그림을 그리고 칼선으로 다시 새길 뿐이다. 서체는 CSS 토큰 `--display`에서 읽는다(원본의 `FONT` 상수 중복 제거).
- **언어별 서체 토큰**: `:root:lang(ko)`, `:root:lang(en)`에서 `--display`, `--body`, `--mono`를 정의한다. 지금은 두 언어 모두 Black Han Sans / Hahmlet / IBM Plex Mono(라틴 글자 포함)를 쓴다.
- **폰트 대기**: 판화를 찍기 전에 현재 언어의 판화 글자와 표지 글자로 `document.fonts.load`를 호출한다. 직접 배포와 preload를 쓰므로 원본의 3.5초 경쟁은 안전장치로만 남긴다.
- **시드 고정**: 장면 판화 시드는 위치가 아닌 `id`의 해시로 정한다. 장면이 끼어들어도 기존 판화 모양이 바뀌지 않는다. 원본은 순번 기반 시드라서, 1단계 원본 비교는 순번 시드로 하고 2단계에서 `id` 시드로 바꾼다(칼선의 끊김 위치만 달라지고 구성은 같다).
- **다시 짜지 않는 것**: 칼선 알고리즘, 고정·먹 입히기·지우기 타이밍, 밀도(dense)·풀림(loose) 판정, 지연 생성/해제 큐는 원본 동작을 그대로 옮긴다. 이번 작업은 분리와 일반화이지 연출 변경이 아니다.

## 7. 날짜·숫자 표시

- 저장은 ISO(`YYYY-MM-DD` 또는 `YYYY-MM`). 기준은 발표가 나온 곳의 현지 날짜.
- 표시 규칙:

| 경우 | ko | en |
| --- | --- | --- |
| 장면 기간 | `2025.01`, `2024.09–10`, `2023.12–2024.02`, `2022.11.30` | `Jan 2025`, `Sep–Oct 2024`, `Dec 2023 – Feb 2024`, `Nov 30, 2022` |
| 항목, 장면과 같은 해 | `01.20` | `Jan 20` |
| 항목, 다른 해 | `2023.01.23` | `Jan 23, 2023` |
| 항목, 월까지만 | `2023.01` | `Jan 2023` |
| 일수 | `1,405` | `1,405` |

- 원본의 축약형(`'23.01.23'`, `'12.05'`)은 이관 스크립트가 장면 대표 날짜의 연도를 기준으로 ISO로 바꾼다.

## 8. 화면

원본 디자인(색, 서체, 레이아웃, 세 가지 애니메이션)을 유지하고 아래만 바꾼다.

### 8.1 설명판

- 날짜 줄: `기간 | 분류`. 판 번호 없음.
- 최근 추가 장면에는 날짜 줄에 `추가 2026.11.02`(en: `Added Nov 2, 2026`).
- 정정이 있는 장면은 설명판 끝에 정정 메모 한 줄.

### 8.2 표지

- 상단: 작품 이름, 기간, 언어 전환(`한국어 EN`).
- 판화 숫자: `heroGlyph`에 일수를 넣은 문자열. 가로가 넓으면 `wide`, 아니면 `tall`.
- 하단: 소개 문구, 최근 추가 바로가기(해당할 때만), `아래로`.

### 8.3 상단 표시줄

- 왼쪽: 작품 이름 + 일수. 오른쪽: 활성 장면의 기간, `목차` 버튼.
- 표시줄 전체가 목차를 여는 버튼이다(원본은 `pointer-events:none`, `aria-hidden`이었음).
- 진행선은 원본처럼 시간 비례.

### 8.4 목차 시트 (모든 화면 크기)

- 연도별 묶음: 연도 + 연도 요약 제목, 그 아래 장면(`MM.DD 제목`, 최근 추가 표시).
- 현재 장면 위치로 스크롤된 채 열린다. 장면을 누르면 해당 장면의 다 먹 입은 지점으로 이동하고 닫힌다.
- 맨 아래: 맺음, 모델 계보·출처 바로가기, 언어 전환.
- `<dialog>`로 구현해 포커스 가두기와 Esc 닫기를 기본 동작으로 얻는다. 열고 닫을 때 애니메이션 없음.
- JS가 없으면 같은 목록이 표지 다음의 일반 `<nav>` 목차로 보인다.

### 8.5 데스크톱 눈금자 (960px 이상)

- 시간 비례 배치 유지.
- 마우스 올림·키보드 포커스 시 `2025.01.27 딥시크 쇼크` 라벨.
- 눈금의 그림은 시간 위치에 두고, 클릭 영역만 겹치지 않게 위아래로 밀어 최소 간격을 확보한다.
- 연도 라벨을 누르면 연도 판으로 이동.

## 9. 빌드 검사

`astro build` 전에 스키마와 교차 검사를 돌린다. 오류는 빌드 실패, 경고는 출력만 한다.

**오류**
- 필수 필드 누락, ko·en 텍스트 누락(장면, 항목, 연도, 시기, 계보 연구소명)
- 날짜 형식 위반, `date`·항목 날짜·`added`가 `asOf`보다 늦음, `added`가 `firstEdition`보다 이름
- 항목 수가 3~4개가 아님
- `id` 또는 `aliases` 중복, 파일명이 `date`와 맞지 않음
- 첫 판 이후 추가된 장면에 출처 없음
- 장면이 있는 연도에 연도 요약 없음
- 금지어: ko `놀라운`, `혁명적`, `게임 체인저` / en `revolutionary`, `game-changer`, `groundbreaking`, `stunning`, `incredible` / 공통 `!`, 이모지
- 상대 시간 표현: ko `오늘`, `최근`, `올해`, `현재` / en `today`, `recently`, `this year`

**경고** (원본 내용 중 일부가 기준을 넘기 때문에 실패시키지 않는다)
- ko: 제목 18자, 요약 110자, 항목 60자 초과
- en: 제목 40자, 요약 220자, 항목 120자 초과
- 맞는 원본 출처가 연결되지 않은 첫 판 장면

## 10. 메타·공유

- `<html lang>`, `<title>`(작품 이름), description(일수·기준일 포함), canonical, `hreflang`(ko, en, x-default=ko)
- `og:title`, `og:description`, `og:url`, `og:image`, `twitter:card=summary_large_image`
- OG 이미지: 언어별 1장(1200×630). `scripts/og.ts`가 빌드 결과의 표지를 Playwright로 찍는다. 일수가 들어가므로 기준일이 바뀌면 다시 만든다. 만든 이미지는 `public/og/`에 커밋해 CI에서 브라우저 없이도 배포할 수 있게 한다.

## 11. 정책과 문서

- `docs/editorial.md`: 장면 선정 기준(원본 우선순위 유지, 연도 배분 대신 "흐름을 바꾼 사건" 기준), 연구소 계보 포함 기준, 문체, 금지어, 출처 원칙(1차 출처 우선, 진행 중 사건은 "보도 기준" 명시, 민감 사안은 양쪽 입장만), 정정 원칙(사실 정정은 기록, 오타는 조용히), 번역 원칙(용어집, 공식 영문명은 1차 출처에서).
- 맺음 끝 "만든 방법": AI 도움으로 조사·작성했다는 사실, 출처 원칙, 오류 제보 링크.
- `.github/ISSUE_TEMPLATE/correction.yml`: 오류 제보 양식(장면, 틀린 내용, 근거 링크).
- `CLAUDE.md`: 장면 추가·정정 절차(리서치 → 출처 확인 → ko·en 작성 → 해당 연도 요약 다시 읽기 → `asOf` 갱신 → 검사·테스트 → PR).
- `content/LICENSE`: CC BY 4.0. 루트 LICENSE(MIT)는 코드에 적용됨을 README에 명시.

## 12. 테스트와 완성 기준

**자동 테스트 (Playwright)**
- ko·en × 390×780, 1440×860: 고정 중인 설명판이 화면 안에 들어가거나 `loose`로 풀림(잘림 없음)
- 콘솔 오류 없음
- JS 끔: 모든 장면 제목과 항목이 HTML에 있고 목차가 보임
- `prefers-reduced-motion`: 모든 항목이 처음부터 먹을 입은 상태
- 목차 시트: 열기, 현재 위치, 장면 이동, Esc 닫기
- 눈금자: 클릭 영역이 겹치지 않음, 라벨 표시, 연도 이동
- 장면 주소(`#id`)와 `aliases`로 바로 들어가면 해당 장면이 보임
- 가로 스크롤 없음

**단위 테스트**
- 일수 계산(2022-11-30 → 2026-10-05 = 1,405), 날짜 포맷 표(7절), 최근 추가 계산, 검사 규칙(일부러 틀린 데이터로 실패 확인)

**원본과의 일치 (1단계 완료 조건)**
- 이관 결과의 한국어 텍스트가 원본 `CH`, `YR`, `LEDGER`와 글자 단위로 같음(판 번호 관련 문구 제외)
- 390×780, 1440×860에서 표지, 연도 판 1개, 장면 3개(조밀한 장면 포함), 맺음을 원본과 나란히 찍어 눈으로 비교

## 13. 단계

1. **기반과 원본 재현 (ko)**: Astro 프로젝트, `reference/original/` 보관, 이관 스크립트로 한국어 내용 이관, 엔진·스크롤 모듈화, 폰트 직접 배포. 원본과 같은 화면이 나오는 것까지.
2. **로그 구조**: 고정 ID와 시드, 판 번호 제거, 기준일 계산, 최근 추가, 정정·갱신 기록, 빌드 검사, 기존 출처 연결.
3. **내비게이션**: 상단 표시줄 버튼, 목차 시트, 눈금자 색인.
4. **영어**: 번역과 용어집, `/en/`, 언어 전환, hreflang, 영어 레이아웃 검증.
5. **공유와 배포**: OG 이미지, 메타, GitHub Actions(PR 검사, Pages 배포), 라이선스 분리, `docs/editorial.md`, `CLAUDE.md`, 이슈 템플릿, README.

## 14. 범위 밖

- 장면별 개별 페이지와 장면별 OG 이미지
- 영어 외 언어 (구조는 열어 두되 추가하지 않음)
- 기존 28개 장면의 출처 재조사
- 역순 보기, 방문 분석, 방문자별 "지난 방문 이후" 표시
- 디자인·연출 변경
