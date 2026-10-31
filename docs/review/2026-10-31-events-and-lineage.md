# 2026년 10월 사건 선정과 모델 계보 검토

확인일: 2026-10-31. 조사 범위는 2026-10-01~2026-10-31이며, 계보에서는 그 전에 공개됐지만 빠져 있던 대표 모델도 보충했다. 사건 날짜는 출처가 사용하는 날짜를 따르고, 시간대에 따라 날짜가 갈리는 경우에는 별도로 표시한다.

## 선정 제안

아래 세 묶음을 선정했고, 사용자의 검토와 디자인 방향 승인 후 장면 3개·이벤트 9개를 추가했다. 모델 계보·용어집·`asOf`도 갱신했다. 최종 박스와 화면 검증은 [적용 기록](2026-10-31-scenes-and-boxes.md)에 정리했다.

| 우선순위 | 장면 후보 | 판단 | 기존 기록과의 관계 |
| --- | --- | --- | --- |
| 1 | ETH 반증 주장과 외부 검증, 10월 26~27일 | 새 장면 추천. 난제 해결 주장뿐 아니라 결과를 공개하고 검증하는 방식의 변화가 핵심이다. | `2026-10-math-review`는 이미 사건 4개이므로 후속 장면으로 분리한다. |
| 2 | PHP 취약점과 사이버 모델의 접근권, 10월 21~29일 | 새 장면 추천. PHP 대응 → Carbon 제한 공개 → Mistral 가중치 공개를 중심에 둔다. | `2026-04-mythos`의 제한 공개가 실제 인터넷 인프라 대응으로 이어지는 장면이다. |
| 3 | 동반자 챗봇의 파산 절차와 미성년자 보호, 10월 12~28일 | 새 장면 추천. 회사의 존속, 대화 데이터 이전, 기능 규제가 함께 문제로 떠올랐다. | `2025-08-teen-chatbots`의 후속이다. |
| 후속 후보 | 미 하원 민주당 위원회 지도부의 사고 보고 요구, 10월 28일 | 기존 통제 장면의 후속 후보로 보관한다. 독립 장면을 만들 사건 수와 후속 조치는 아직 부족하다. | `2026-10-offline`도 사건이 4개라 그대로 덧붙일 수 없다. |
| 보류 | AI 투자 수익성 우려와 시장 하락, 10월 15~30일 | 단기 주가 움직임만으로 흐름 전환을 확정하기 어렵다. 실제 투자 축소·계약 변경·자금 조달 조건의 변화를 더 본다. | 채택한다면 2026년 연도 요약도 다시 쓴다. |

## Claude 답변에서 유지하거나 고칠 부분

| Claude의 제안·표현 | 검토 결과 |
| --- | --- |
| ETH를 최우선 새 장면으로 선정 | 유지. 다만 제목과 사건 문장은 ‘반증 주장·검토 착수’로 쓴다. |
| Lean 형식 검증과 외부 검토 진행을 함께 설명 | 유지·보충. Claude도 검토가 인증을 뜻하지 않는다고 명시했다. 여기에 형식 증명 검사와, 형식 명제가 원래 문제·논문과 일치하는지 확인하는 일의 차이를 더한다. |
| ARTEX를 사이버 장면의 첫 사건으로 배치 | 보조 사건으로 낮춘다. 1차 발표가 있는 PHP 대응을 중심에 놓으면 출처와 역사적 의미가 더 분명하다. |
| Google은 막고 Mistral은 푼다는 대비 | 접근 방식의 차이는 유지하되, ‘안전장치 유무’의 대립으로 쓰지 않는다. Mistral도 방어 목적과 악성 요청 거부를 설명한다. |
| Character.AI 파산과 뉴욕주 법을 한 장면으로 묶기 | 유지. 10월 14일 법무장관들의 소비자 보호 요구를 보충하면 사건 3개가 된다. |
| Character.AI의 Chapter 11 신청 | 유지·보충. 회사가 절차 중 운영을 계속한다고 발표했다는 점을 더해, 신청이 곧 서비스 종료를 뜻한다는 오해를 막는다. |
| AI 투자 회의론 보류 | 동의. 일부 하락 수치는 기사 원문에서 확인되지만 ‘AI 거품 붕괴’까지 뒷받침하지는 않는다. |
| GPT-6.1 Sol과 Terra 중 하나를 대표로 고르기 | 둘 다 계보에 넣는다. 역할이 다른 별도 모델이고, 최초 공개 월도 다르다. Sol은 9월, Terra는 10월이다. |
| Haiku 5.5가 소형 모델이므로 계보 기준 판단 필요 | 계보에 포함하는 것으로 제안한다. 대표 범용 모델의 새 계열 갱신으로 보고, 독립 장면으로 만들지는 않는다. |
| 계보에서 Carbon·Sol/Terra·Haiku만 검토 | 범위가 부족하다. Muse Spark Open, DeepSeek V4.1 Flash 및 1017, Mistral Large 4와 기존 누락도 보충한다. |

## 장면별 근거와 구성안

### 1. ETH 반증 주장과 외부 검증

[OpenAI의 10월 26일 발표](https://openai.com/index/building-scientific-understanding-with-academic-communities/)는 ETH, 조화해석, 양자장론 결과를 서로 다른 검토·공개 방식에 맡긴다. ETH는 자연어 원고와 Lean 형식화를 공개하고 Impagliazzo·Paturi·Williams가 이끄는 외부 검토를 받는다. 물리학 자료는 협력 연구진의 정리를 기다린다. 같은 발표 안에서도 공개 범위가 다르므로 전부 공개 검증이 끝났다고 묶으면 안 된다.

[Anthropic의 원본 저장소](https://github.com/anthropics/formal-math/tree/main/eth)는 내부 Claude 연구 모델이 찾은 알고리즘과 형식화를 제공한다. README는 결과가 점근적이어서 실용적인 SAT 해결 성능을 뜻하지 않는다고 명시한다. 또한 Lean이 증명을 검사해도 형식 명제와 논문이 같은 내용을 말하는지는 사람이 확인해야 한다고 설명한다. 로컬 `defuddle`로 README 본문을 확인했다.

[최초 추가 커밋](https://github.com/anthropics/formal-math/commit/16a5ce41304fcdaea4e0be7c132e1c361dc26da5)은 GitHub API상 `2026-10-27T03:07:21Z`다. 미국 동부에서는 10월 26일이므로 ‘OpenAI 26일, Anthropic 27일’이 반드시 서로 다른 현지 날짜를 뜻하지는 않는다.

사건 3개 구성안은 ① 10월 26일 OpenAI의 ETH 반증 주장과 외부 검토 착수, ② 같은 날 OpenAI의 조화해석 결과와 형식화 공개, ③ 10월 27일 UTC 기준 Anthropic의 별도 알고리즘·형식화 공개다. 양자장론 결과까지 다룬다면 자료 공개를 유보한 네 번째 항목으로 두고, 결과별 검토 방식의 차이는 장면 설명에 담는다. 제목은 ‘ETH 반증 주장, 검증은 누구의 몫인가’ 정도가 적절하다.

이 검토에서는 형식 증명을 직접 빌드하거나 수학적 타당성을 판정하지 않았다. ‘P=NP 해결’, ‘암호가 즉시 무력화됨’, ‘밀레니엄 문제 전체 해결’로 확대하지 않는다. Claude 답변의 ‘49쪽’, 두 회사의 발견일 일치 같은 세부는 장면의 필수 정보로 채택하지 않았다.

### 2. PHP 취약점 대응과 사이버 모델의 접근권

사건 3개를 다음처럼 구성하는 것을 추천한다.

| 날짜 | 넣을 사실 | 확인한 원문 |
| --- | --- | --- |
| 10월 21일 | PHP가 인증 없는 원격 코드 실행 취약점 2개의 수정 버전을 공개한다. OpenAI는 Calif가 GPT-5.6 Sol로 발견한 취약점과 Wiz의 독립 발견, 유지관리자 중심의 공동 대응을 설명한다. | [PHP 공식 기록](https://www.php.net/archive/2026.php), [OpenAI의 Patch the Planet 발표](https://openai.com/index/coordinated-disclosure-of-critical-vulnerabilities/) |
| 10월 28일 | Google이 Gemini 4 Carbon을 발표하고 일부 사이버 방어 담당자부터 접근을 넓히겠다고 밝힌다. | [Google 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) |
| 10월 29일 | Mistral이 Large 4의 가중치를 공개하고 자체 인프라에서의 방어·코딩 활용을 내세운다. | [Mistral 가중치 공개 발표](https://mistral.ai/news/mistral-large-4-oss/) |

이는 ‘공격 능력이 강해졌다’에서 ‘누가 접근하고, 누가 발견을 검토하며, 누가 대규모 패치를 배포하는가’로 초점이 옮겨가는 장면이다. 제목은 ‘AI가 찾은 결함, 방어에 주어진 시간’을 제안한다. Mistral Large 4는 10월 6일 공개 프리뷰와 29일 가중치 공개를 구분한다.

한국 맥락을 더하려면 ARTEX를 네 번째 사건으로 검토할 수 있다. 다만 [ASEC의 10월 29일 글](https://asec.ahnlab.com/ko/96187/)은 보도·기관 발표·업체 분석을 종합한 자료다. 금융권 공격과 별도 검거 사건을 같은 조직의 소행으로 묶지 않는다. Claude 답변의 ‘10월 4일 위원장 발언·7개사’는 정부 원문을 확보하지 못했으므로 확정 날짜·수치로 채택하지 않았다.

### 3. 동반자 챗봇의 파산 절차와 미성년자 보호

| 날짜 | 넣을 사실 | 확인한 원문 |
| --- | --- | --- |
| 10월 12일 | Character.AI가 델라웨어 법원에 자발적 Chapter 11을 신청하고 매각 절차를 추진한다. Disney의 2천만 달러 제안은 일부 지식재산 등의 비독점 영구 라이선스에 관한 최초 입찰이며 완료된 인수가 아니다. | [회사 발표 원문 재게시본](https://www.streetinsider.com/Business%2BWire/Character.ai%2BInitiates%2BVoluntary%2BChapter%2B11%2BProceeding%2Bto%2BFacilitate%2BValue-Maximizing%2BSale%2BProcess/27175607.html) |
| 10월 14일 | 뉴욕주 법무장관과 다른 39명의 법무장관이 매각 과정에서 아동·소비자와 민감한 대화 데이터를 보호하라고 요구한다. | [뉴욕주 법무장관 발표](https://ag.ny.gov/press-release/2026/attorney-general-james-urges-court-protect-children-and-consumers-characterai) |
| 10월 28일 | 뉴욕주지사가 미성년자에게 위험한 AI 동반자 기능을 금지하는 S.9051B/A.10379C에 서명한다. 본문상 시행일은 2027년 1월 1일이다. | [주지사 발표](https://www.governor.ny.gov/news/governor-hochul-signs-nation-leading-legislation-protect-kids-ai-chatbots-and-ensure-baby), [주의회 B안 본문·서명 기록](https://www.nysenate.gov/legislation/bills/2025/S9051/amendment/B) |

제목은 ‘AI 친구가 남긴 대화는 누구에게 가는가’를 제안한다. 법무장관들의 문제 제기는 당국의 주장으로 귀속하고, 회사의 운영 지속 입장도 함께 적는다. 파산 신청만으로 서비스 종료나 Disney에 대한 사용자 대화 이전이 확정됐다고 쓰지 않는다. 10월 28일 법은 모든 AI 챗봇의 전면 금지가 아니라 미성년자에게 제공하는 특정 위험 기능에 대한 규제다.

### 기존 장면의 후속·보류 후보

- **사고 보고:** [10월 28일 미 하원 민주당 위원회 지도부 발표](https://democrats-science.house.gov/news/press-releases/house-democratic-committee-leaders-request-frontier-ai-companies-report-misalignment-and-safety-incidents-to-congress-within-48-hours)는 5개 회사에 새 사고를 발견한 뒤 48시간, 핵심 기반시설 관련 사고는 24시간 이내 보고하도록 요구한 서한이다. 새로 시행된 연방법이나 의회 전체의 결정으로 쓰면 안 된다. 기존 격리 장면의 후속 자료로 보관한다.
- **시장:** [Korea Times 10월 30일 기사](https://www.koreatimes.co.kr/economy/others/20261030/kospi-falls-348-as-us-tech-earnings-fuel-ai-investment-concerns) 본문에서 코스피 3.48% 하락, Alphabet 12.64% 하락을 확인했다. 기사 해석을 넘어 구조적 투자 전환을 단정하지 않는다. Claude가 함께 제시한 Nscale 보증 협상과 SK하이닉스 매출 수치는 이번 검토의 확정 사실에 포함하지 않았다.
- **일반 출시·제휴:** 새 모델의 존재만으로 장면을 늘리지 않는다. DevDay, 개별 제휴, 사무소 개설은 채택 후보의 흐름을 독립적으로 바꾼다는 추가 근거가 있어야 한다.

## 모델 계보에 반영한 내용

기준은 대표 범용 모델의 최초 공개 월이다. 제한 공개와 프리뷰를 포함하며, 같은 이름의 서비스 갱신이나 전문 음성·영상 모델은 별도 항목으로 세지 않는다. 모든 과거 모델을 나열하는 전체 카탈로그로 확장하지는 않았다.

| 연구소 | 추가한 모델 | 월·근거 |
| --- | --- | --- |
| OpenAI | GPT-6 Sol, GPT-6 Luna | 2026-09. [9월 22일 발표](https://openai.com/index/introducing-gpt-6-sol-and-luna/). 기존 장면에는 있었지만 계보에는 빠져 있었다. |
| OpenAI | GPT-6.1 Sol | 2026-09. [9월 29일 시스템 카드](https://deploymentsafety.openai.com/gpt-6-1-sol). Claude 답변의 10월 분류를 수정한다. |
| OpenAI | GPT-6.1 Terra | 2026-10. [10월 26일 시스템 카드](https://deploymentsafety.openai.com/gpt-6-1-terra), [OpenAI API 모델 문서](https://developers.openai.com/api/docs/models/gpt-6.1-terra). |
| Anthropic | Mythos 5, Sonnet 5 | 2026-06. [공식 시스템 카드 목록](https://www.anthropic.com/system-cards)의 공개 월. |
| Anthropic | Mythos 5.1, Sonnet 5.5 | 2026-09. 같은 [시스템 카드 목록](https://www.anthropic.com/system-cards). Fable 5.1·Opus 5.5와 함께 기록한다. |
| Anthropic | Haiku 5.5 | 2026-10. [Haiku 공식 페이지](https://www.anthropic.com/claude/haiku)의 10월 7일 공지. |
| Google | Gemini 4 Carbon | 2026-10. [10월 28일 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/). 일반 공개 완료를 뜻하지 않는다. |
| Meta | Muse Spark Open | 2026-10. [10월 15일 가중치 공개](https://research.meta.ai/blog/muse-spark-open). |
| DeepSeek | V4.1 Flash | 2026-09. [9월 10일 공식 발표](https://api-docs.deepseek.com/news/news260910/). |
| DeepSeek | V4.1 Flash 1017 | 2026-10. [10월 17일 공식 발표](https://api-docs.deepseek.com/news/news261017/). 기존 별칭의 서비스 갱신과 구분되는 이름 있는 공개 버전으로 기록한다. |
| Mistral AI | Mistral 7B → Large → Large 2 → Large 3 → Large 4 | 연구소를 추가했다. [2023-09](https://mistral.ai/news/announcing-mistral-7b/), [2024-02](https://mistral.ai/news/mistral-large/), [2024-07](https://mistral.ai/news/mistral-large-2407/), [2025-12](https://mistral.ai/news/mistral-3/), [2026-10 프리뷰](https://mistral.ai/news/mistral-large-4/), [10월 가중치 공개](https://mistral.ai/news/mistral-large-4-oss/)로 주요 이력을 잇는다. |

Meta의 기존 Muse Wonder(2026-10)는 [10월 12일 발표](https://research.meta.ai/blog/muse-wonder)와 맞는다. Grok 4.7(2026-09)도 [9월 21일 발표](https://x.ai/news/grok-4-7)와 맞아 유지했다. 연구소 이름은 공식 사이트의 표기에 맞춰 `xAI · SpaceXSI`로 고쳤다. [10월의 Grok Voice 3.0](https://x.ai/news/grok-voice-3)은 전문 음성 모델이므로 이번 범위에서 제외했다.

Gemini 4 Argon의 기존 2026-09 표기는 [9월 30일 제한 공개 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) 원문과 맞아 유지했다. [10월 13일 발표문](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/)은 일반 공개 확대에 관한 글이므로, 이를 최초 공개와 혼동해 계보를 10월로 옮기지 않았다. 용어집의 출처도 9월 최초 발표문으로 바꿨다.

## 반영 범위

- `content/ledger.yaml`: 모델 18개와 Mistral AI 연구소 추가, xAI 계열의 연구소 표기 갱신, 근거 주석 추가.
- `content/glossary.yaml`: 새 이름과 공식 출처 추가.
- `content/site.yaml`: `asOf`를 `2026-10-31`로 갱신.
- `tests/unit/view.test.ts`, `tests/e2e/static.spec.ts`: 기준일, 장면 41개·이벤트 157개·박스 203개, 새 장면의 추가 표시를 반영.
- `content/years.yaml`: ‘위임과 통제’라는 주제를 유지하면서 수학 검증과 동반자 챗봇의 아동·대화 데이터 보호를 보충.
- `content/scenes/2026-10-26-eth-review.yaml`, `2026-10-21-cyber-defense.yaml`, `2026-10-12-companion-rules.yaml`: 장면마다 사건 3개, 한국어·영어 문구, 출처와 `glyph` 추가.
- `public/og/ko.png`, `public/og/en.png`: 새 박스가 반영된 공유 이미지로 재생성.

## 확인 범위

검색 요약만으로 채택을 결정하지 않고, 위 핵심 후보의 회사·정부·의회 원문을 직접 열었다. Character.AI는 회사가 배포한 Business Wire 발표의 재게시본을 사용했다. 소송·파산의 전체 기록을 검토한 것은 아니다. Anthropic의 ETH 저장소는 웹 도구에서 열리지 않아 로컬 `defuddle`로 본문을 읽고 GitHub API로 추가 커밋 시각을 확인했다. 이후 커밋 목록 페이지에 대한 `defuddle` 요청은 429 응답을 받았으며, 이를 전체 사이트의 네트워크 차단으로 해석하지 않았다.

## 로컬 검증 결과

- `npm run check`: 오류 0, 경고 0. hint 29개는 변경 전과 같음.
- `npm test`: 10개 파일, 89개 테스트 통과. `asOf` 변경으로 이전 날짜를 기대하던 테스트 1곳을 갱신한 뒤 통과했다.
- `npm run build`: 한국어·영어 정적 페이지 생성 성공. 콘텐츠 경고 없음.
- `npm run budget`: 영어 판 글꼴 7,036B, 한국어 판 글꼴 22,256B, 클라이언트 JS 15,254B로 모두 예산 이내.
- `npx playwright test --project=chromium`: 78개 통과.
- 생성된 두 언어 HTML에 새 모델 18개와 `SpaceXSI` 표기가 모두 있는지 확인했다. 계보의 중복·미래 날짜와 용어집 YAML도 검사했다.
- `git diff --check` 통과. 작업 전에 stage돼 있던 `.gitignore`의 diff가 그대로인지 확인했다.
