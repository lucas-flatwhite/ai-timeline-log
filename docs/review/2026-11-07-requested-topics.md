# 요청 소재 12건 타임라인 후보 조사

확인일: 2026-11-07. 사용자가 말한 소재 12건을 `npm run index -- --grep`으로 먼저 대조한 뒤, 없는 소재만 조사했다. 각 출처의 발표 날짜를 사용하며 한국 시간으로 변환하지 않았다. 아래 선정 순위와 장면 구성 의견은 편집 판단이며 아직 콘텐츠에 반영되지 않았다. 같은 날의 [기간 조사](2026-11-07-event-research.md)와 별개의 목록이다.

공식 발표, 저장소 정보, 원문을 직접 확인했다. OpenAI 페이지는 직접 열리지 않아 검색 결과에 나온 본문 일부와 언론 보도로 확인했다. GitHub 별 수는 2026-11-07 기준이다.

## 선정 결과

사용자가 2026-11-07에 아래를 선정했다. 작성은 새 세션에서 이 노트와 장면 인덱스로 진행한다.

- 새 장면 7개: 후보 1(월드모델), 2(Coxon), 3(ChatGPT 재구성), 4(생각하는 모델), 5(Claude Code), 7(Muse Spark), 8(LLM Wiki와 GBrain).
- 기존 장면 추가: [기간 조사](2026-11-07-event-research.md)의 후보 4(METR)를 `2026-11-research-acceleration`의 4번째 항목으로.
- 추가 조사: Claude Cowork는 후보 5에 넣고 `2026-02-saaspocalypse`의 문장을 고친다. 아래 “추가” 절 참고.
- 선정하지 않음: 후보 6(Jev). 기간 조사의 나머지 후보는 사용자가 다음에 검토한다.
- 후보 7은 기존 Muse 항목 2개를 옮기므로 두 장면의 `updated`를 함께 갱신한다. `asOf`는 작업일로 올린다.

### 작성 결과 (2026-11-07)

위 선정대로 장면을 작성했다. 작성하며 아래 내용이 이 노트와 달라졌다.

- 후보 2는 4개 항목이다. 뉴욕시의회 보도자료와 AP로 OpenAI, 메타, 구글, Anthropic 대표의 선서 증언을 확인해 회사 쪽 항목을 넣었다. 아래 후보 2의 “회사들이 무엇을 증언했는지는 확인하지 못했고”는 이 확인으로 해소됐다.
- 후보 4의 Gemini 날짜는 Google 변경 기록(2024-12-19)으로 확인했고, 경고 메일 날짜는 Ars Technica 보도일(2024-09-16)이다.
- 후보 8의 세 번째 항목은 Obsidian CLI다. 공식 변경 기록의 공개 버전 날짜(2026-02-27)를 썼다.
- 후보 7에 맞춰 `content/ledger.yaml`에 Muse Spark(2026-04)를 더했다. 옮긴 두 항목의 옛 주소는 새 장면의 `aliases`로 남겼다.

## 소재별 확인 결과

| 소재 | 타임라인 | 결과 |
| --- | --- | --- |
| Jev | 없음 | 후보 6. 2026-09-15 공개 |
| 옵시디언 세컨드 브레인 | 없음 | 후보 8. 기점은 카파시의 2026-04-04 글 |
| Claude Code의 기능 변화 | 일부 있음 | 공개와 정식 출시까지만 있음. 후보 5 |
| 나노 바나나 | **있음** | `2025-08-gpt-5`의 2025-08-26 항목과 용어집. 추가 조사 불필요 |
| GPT의 큰 변화 | 일부 있음 | 모델 출시는 대부분 있음. ChatGPT 개편은 없음. 후보 3 |
| Y Combinator의 큰 변화 | 없음 | 구조 변화가 확인되지 않아 사용자가 제외 |
| GBrain 같은 지식 베이스 | 없음 | 후보 8. 2026-04-05 공개 |
| AI 연구자의 TV 인터뷰 | 없음 | 후보 2. Jacob Coxon의 The Daily Show 출연(2026-10-05), 사용자 확인 |
| 메타 Muse | 일부 있음 | Muse 에이전트(09-08), Muse Spark Open(10-15)은 있음. 첫 공개인 Muse Spark(04-08)는 없음. 후보 7 |
| 월드모델 | 없음 | 후보 1 |
| Claude Work | 없음 | 제품명은 Claude Cowork, 사용자 확인. 플러그인 항목에 이름이 빠져 있음. “추가” 절 참고 |
| OpenAI의 thinking | 일부 있음 | o1(2024-09-12)은 있음. 사고 과정의 확산과 공개 논쟁은 없음. 후보 4 |

## 우선 검토할 후보

| 우선순위 | 날짜 | 사건 | 선정 이유 | 반영 방식 제안 |
| --- | --- | --- | --- | --- |
| 1 | 2025-08-05~2026-10-27 | Genie 3에서 Genie 4까지 월드모델의 공개, 게임주 급락, AMI Labs 투자 | 타임라인에 월드모델이 전혀 없다. LLM과 다른 방향에 큰 자본이 들어갔고 시장도 반응했다. | 새 장면. Genie 3, Project Genie, AMI Labs, Genie 4의 4개 항목. |
| 2 | 2026-09-08~10-05 | Jacob Coxon의 Anthropic 퇴사 공개 발언, 뉴욕시의회 증언, The Daily Show 출연 | 연구소 내부자의 경고가 방송과 지방의회까지 갔다. 기존 `2026-09-pace`의 앞 사건이 빠져 있다. | 새 장면 3개 항목. 또는 `2026-09-pace` 재구성. |
| 3 | 2026-02-13~07-09 | GPT-4o 퇴역, ChatGPT와 Codex 통합, ChatGPT Work 공개 | ChatGPT가 대화 앱에서 작업 에이전트로 재구성됐다. 기존 장면은 모델 이름만 다룬다. | 새 장면. GPT-4o 퇴역, 슈퍼앱 계획, ChatGPT Work의 3개 항목. |
| 4 | 2024-09~2025-02 | 답하기 전에 생각하는 모델의 확산과 사고 과정 공개 논쟁 | o1은 있지만 숨긴 사고 과정을 다른 회사가 보여 주고 OpenAI도 일부 연 흐름이 없다. | 새 장면. 경고 메일, Gemini, o3-mini, Claude 3.7의 4개 항목. |
| 5 | 2025-10-20~2026-04-14 | Claude Code가 터미널을 벗어나 클라우드, 공개 표준, 다중 에이전트, 무인 실행으로 확장 | Agent Skills는 다른 회사도 채택했다. 타임라인의 Claude Code는 정식 출시에서 멈춰 있다. | 새 장면. web, Agent Skills, 에이전트 팀, routines의 4개 항목. |
| 6 | 2026-09-15~10-06 | TypeSafe의 Jev 공개 후 Amazon, Cloudflare, OpenAI가 결정 모델을 내놓음 | 글을 생성하지 않는 모델 범주가 3주 안에 대형 회사로 번졌다. | 새 장면. Jev, Amazon·Cloudflare, OpenAI의 3개 항목. |
| 7 | 2026-04-08 | Meta, 첫 Muse 모델 Muse Spark를 비공개 가중치로 공개 | Llama로 대표되던 Meta의 공개 방침이 바뀐 시점인데 타임라인에 없다. | 새 장면. 다른 장면의 Muse 항목 2개를 옮겨 3개로 구성. |
| 8 | 2026-04-04~04-05 | 카파시의 LLM Wiki와 GBrain 공개 | 에이전트가 마크다운 지식 베이스를 직접 쓰고 고치는 방식이 퍼졌다. | 새 장면 가능. “흐름을 바꾼 사건” 기준은 경계선. |
| 추가 | 2026-01-12~09-16 | Anthropic, 비개발 업무용 에이전트 Claude Cowork 공개, 이후 채팅과 통합 | 18일 뒤 플러그인과 2월 3일 급락의 출발점인데 타임라인에 이름이 없다. | 후보 5 장면의 항목으로 추가. `2026-02-saaspocalypse` 1번째 항목 문장 수정. |

### 1. 월드모델, 2025년 8월~2026년 10월

- Google DeepMind는 2025년 8월 5일 Genie 3를 공개했다. 글로 지시하면 720p, 초당 24프레임의 상호작용 환경을 실시간으로 만들고 몇 분간 일관성을 유지한다. 제한된 연구 미리보기였다. [DeepMind](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/)
- Google은 2026년 1월 29일 미국 Google AI Ultra 구독자에게 Project Genie를 열었다. 다음 거래일인 1월 30일 Take-Two, Roblox, Unity 주가가 급락했다. Unity는 장중 21%(Reuters 인용 보도), 종가 기준 24.22% 내렸다. [Google](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/project-genie/), [보도](https://www.itiger.com/news/2607502338), [GIGAZINE](https://gigazine.net/gsc_news/en/20260131-game-stocks-slide-google-project-genie/)
- Yann LeCun의 AMI Labs는 2026년 3월 10일 10억 3,000만 달러 시드 투자를 발표했다. 투자 전 기업가치는 35억 달러로 보도됐다. [AIwire](https://www.hpcwire.com/aiwire/2026/03/11/yann-lecuns-ami-secures-1b-seed-to-develop-ai-world-models/), [The AI Insider](https://theaiinsider.tech/2026/03/10/yann-lecuns-ami-labs-raises-1b-in-seed-round-to-develop-world-model-ai-systems/)
- Google DeepMind는 2026년 10월 27일 Genie 4를 연구 미리보기로 공개했다. 자사 실시간 월드모델 중 처음으로 음성을 직접 생성한다고 설명한다. [DeepMind](https://deepmind.google/blog/genie-4-a-new-generation-of-world-simulation/)

기록할 수 있는 문장: “Google, Project Genie를 공개한 다음 날 Unity 주가가 24% 떨어졌다.” / “Yann LeCun의 AMI Labs, 월드모델 개발에 시드 투자 10억 3,000만 달러 유치.”

기존 장면: 없음. 주제는 `models`를 제안한다. 게임주 항목은 `2026-02-saaspocalypse`(4개)의 업종 급락과 같은 시기다.

영어 표기: Genie 3, Project Genie, Genie 4, AMI Labs (Advanced Machine Intelligence Labs), Yann LeCun은 용어집에 없다. Google 표기는 위 원문, AMI Labs는 공식 페이지를 작성 단계에서 확인한다. World Labs의 Marble과 10억 달러 투자도 후보지만 1차 출처를 확인하지 못해 넣지 않았다.

주의: Google은 Project Genie와 Genie 4를 실험 단계로 설명하며, 긴 세션에서 사물과 세부가 흐트러질 수 있다고 밝혔다. 게임주 하락 뒤 분석가들은 과도한 반응이라고 평가했고 일부 반등이 있었다. AMI Labs는 조사 시점까지 상용 제품이 없다고 보도됐다. 투자액은 1차 공시가 아니라 회사와 LeCun 발표를 전한 보도 기준이다.

### 2. Jacob Coxon의 경고, 9월 8일~10월 5일

- Anthropic 연구원 Jacob Coxon은 9월 8일 퇴사를 알리며 OpenAI와 Anthropic 모두 책임 있게 행동하지 않는다고 X에 썼다. TIME 인터뷰에서는 AI 진전이 빨라지고 통제되지 않는다고 말했다. [Coxon의 X 게시물](https://x.com/hilbertspaess/status/2097476196791709843), [TIME](https://time.com/article/2026/09/09/ai-anthropic-openai-jacob-coxon/)
- CBS의 60 Minutes는 9월 13일 시즌 첫 방송에서 Ross Douthat의 논평으로 AI 안전을 다뤘다. Coxon이 직접 출연한 것은 아니다. [Mediaite](https://www.mediaite.com/media/tv/ross-douthat-delivers-dire-ai-warning-to-close-out-60-minutes-debut-the-clock-is-ticking/)
- Coxon은 10월 5일 뉴욕시의회 청문회에서 내부 고발자 패널로 증언했고, 같은 날 밤 The Daily Show에서 Jon Stewart와 대담했다. Stewart는 대담이 생각보다 무거웠다고 반응했다. [NY1](https://ny1.com/nyc/all-boroughs/politics/2026/10/05/city-council-takes-on-the-debate-over-ai-risk), [LateNighter](https://latenighter.com/news/jon-stewart-former-anthropic-researcher-jacob-coxon-daily-show/), [Yahoo](https://www.yahoo.com/entertainment/tv/articles/more-sobering-imagined-jon-stewart-162547038.html), [The Daily Show 게시물](https://x.com/TheDailyShow/status/2107531924965069242)

기록할 수 있는 문장: “Anthropic 연구원 Jacob Coxon, 퇴사하며 OpenAI와 Anthropic 모두 책임 있게 행동하지 않는다고 공개 비판.” / “Coxon, 뉴욕시의회 청문회에서 증언하고 같은 날 The Daily Show에 출연.”

기존 장면: `2026-09-pace` (4개). 9월 12일 Amodei 글부터 시작하며 Coxon은 없다. 이 장면이 꽉 차 있어 새 장면을 제안한다. 주제는 `safety`, `society`를 제안한다.

영어 표기: Jacob Coxon, The Daily Show, New York City Council은 용어집에 없다. 출처는 위 게시물과 보도다.

주의: 민감한 사안이므로 양쪽 입장만 적는다. Coxon의 위험 전망은 개인 주장이고 확인된 사실이 아니다. TIME 기사 시점에 Anthropic과 OpenAI는 답하지 않았다. Anthropic의 Evan Hubinger가 X에서 일부 동의했지만 회사 입장이 아니다. 대통령은 위험이 과장됐다는 취지로 말했다고 보도됐다. 청문회에서 회사들이 무엇을 증언했는지는 확인하지 못했고, 출석이 강제였는지도 출처마다 다르다.

### 3. ChatGPT의 재구성, 2월 13일~7월 9일

- OpenAI는 2026년 2월 13일 ChatGPT에서 GPT-4o 등을 내렸다. 매일 GPT-4o를 고르는 사용자가 0.1%라고 밝혔다. [OpenAI 발표](https://openai.com/index/retiring-gpt-4o-and-older-models/), [도움말](https://help.openai.com/en/articles/20001051-retiring-gpt-4o-and-other-chatgpt-models), [Engadget](https://www.engadget.com/ai/openai-has-officially-retired-the-controversial-gpt-4o-model-181553067.html)
- CNBC는 3월 19일 OpenAI가 ChatGPT 앱, 브라우저, Codex 앱을 하나의 데스크톱 앱으로 합친다고 보도했다. [CNBC](https://www.cnbc.com/2026/03/19/openai-desktop-super-app-chatgpt-browser-codex.html)
- OpenAI는 7월 9일 앱과 파일을 넘나들며 몇 시간씩 작업을 끝내는 에이전트 ChatGPT Work를 공개하고, Codex 앱을 새 ChatGPT 데스크톱 앱에 합쳤다. [OpenAI 발표](https://openai.com/index/chatgpt-for-your-most-ambitious-work/), [9to5Mac](https://9to5mac.com/2026/07/09/openai-announcing-the-next-chapter-for-chatgpt-today-watch-here/)

기록할 수 있는 문장: “OpenAI, ChatGPT Work를 공개하고 Codex 앱을 ChatGPT 데스크톱 앱에 합쳤다.”

기존 장면: `2026-07-sandbox-escape` (4개)의 07-09 항목은 GPT-5.6만 다룬다. `2025-08-gpt-5`에는 GPT-4o를 되살린 일이 있어, 2월 퇴역이 그 후속이다. 주제는 `agents`, `models`를 제안한다.

영어 표기: ChatGPT Work는 용어집에 없다. 출처는 위 OpenAI 발표다.

주의: 3월 항목은 보도이고 OpenAI 발표가 아니다. API의 GPT-4o 종료 일정은 출처가 엇갈려 쓰지 않는다. Atlas 브라우저 종료는 2차 출처뿐이라 넣지 않았다.

### 4. 답하기 전에 생각하는 모델, 2024년 9월~2025년 2월

- 단계적 사고의 출발점은 프롬프트 기법이다. Google 연구진의 chain-of-thought 논문이 2022년 1월 28일 나왔다. ChatGPT 이전이라 칸이 될 수 없고 `lede` 배경으로만 쓸 수 있다. [arXiv](https://arxiv.org/abs/2201.11903)
- OpenAI는 2024년 9월 12일 “답하기 전에 더 오래 생각하도록” 설계한 o1을 공개했다. 강화학습으로 사고 과정을 학습시켰고, 원본 사고 과정은 사용자에게 보여 주지 않는다고 밝혔다. [OpenAI](https://openai.com/index/learning-to-reason-with-llms/), [Simon Willison의 원문 인용](https://simonwillison.net/2024/Sep/12/openai-o1/)
- 9월 중순 o1의 사고 과정을 캐묻던 사용자들이 OpenAI의 경고 메일을 받았다고 보도됐다. [GIGAZINE](https://gigazine.net/gsc_news/en/20240919-openai-threaten-ban)
- Google은 12월 19일 사고 과정을 생성하는 Gemini 2.0 Flash Thinking 시험판을 냈다. 다음 달 R1이 사고 과정 전체를 드러냈고, OpenAI는 2025년 2월 6일 o3-mini의 사고 과정을 더 자세히 보여 주기 시작했다. [GIGAZINE](https://gigazine.net/gsc_news/en/20241220-google-gemini-flash-thinking), [TechCrunch](https://techcrunch.com/2025/02/06/openai-now-reveals-more-of-its-o3-mini-models-thought-process)
- Anthropic은 2025년 2월 24일 빠른 답변과 긴 사고를 고를 수 있는 Claude 3.7 Sonnet을 공개했다. 사고 과정을 사용자에게 보여 주고, API에서 생각 길이를 정할 수 있다. [Anthropic](https://www.anthropic.com/news/claude-3-7-sonnet)

기록할 수 있는 문장: “OpenAI, o1의 사고 과정을 캐묻는 사용자에게 경고 메일을 보낸 것으로 보도.” / “OpenAI, DeepSeek R1 공개 뒤 o3-mini의 사고 과정을 더 자세히 표시.” / “Anthropic, 빠른 답변과 긴 사고를 고를 수 있는 Claude 3.7 Sonnet 공개.”

기존 장면: o1은 `2024-09-reasoning-nobel` (4개), o3는 `2024-11-computer-use-mcp` (4개), R1은 `2025-01-deepseek` (4개)에 있다. Claude 3.7은 `2025-02-vibe-coding` (4개)에 있지만 사고 기능은 언급하지 않는다. 사고 과정을 숨기느냐 보여 주느냐가 빠져 있어, 경고 메일, Gemini, o3-mini, Claude 3.7의 4개 항목으로 새 장면을 제안한다. 주제는 `models`를 제안한다. 별도로 o1 항목 문장에 “답하기 전에 더 오래 생각”을 넣는 수정도 가능하다.

영어 표기: chain-of-thought, Gemini 2.0 Flash Thinking, extended thinking은 용어집에 없다. Gemini는 Google 원문을 작성 단계에서 확인한다.

주의: “OpenAI가 thinking을 처음 제안”은 정확하지 않다. 단계적 사고 프롬프트는 Google 연구진의 논문이 먼저이고, OpenAI는 이를 강화학습으로 학습시킨 제품을 먼저 냈다. OpenAI 원문은 직접 열리지 않아 인용으로 확인했다. Q*와 Strawberry는 Reuters의 익명 소식통 보도이며 OpenAI가 확인하지 않아 넣지 않았다. “시장 최초의 하이브리드 추론 모델”은 Anthropic의 주장이다. Gemini 날짜는 2차 출처 하나다. 표시되는 사고 과정이 모델의 실제 계산과 같다고 쓰지 않는다.

### 5. Claude Code의 기능 변화, 2025년 9월~2026년 4월

- 바탕 기능: 훅은 2025년 6월 30일, 서브에이전트는 7월 24일에 들어왔다. 9월 29일의 2.0은 체크포인트, VS Code 확장, Claude Agent SDK를 함께 냈다. [변경 기록](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md), [Anthropic](https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously)
- 10월 9일 플러그인, 10월 16일 Agent Skills가 나왔고, 12월 18일 Agent Skills를 agentskills.io의 공개 표준으로 냈다. 이틀 뒤 OpenAI가 Codex 문서에 Skills를 추가했다. [플러그인](https://claude.com/blog/claude-code-plugins), [Skills](https://claude.com/blog/skills), [Simon Willison](https://simonwillison.net/2025/dec/19/agent-skills)
- 10월 20일 Claude Code on the web으로 브라우저에서 맡긴 작업이 Anthropic 클라우드의 격리 환경에서 돌기 시작했다. [Anthropic](https://claude.com/blog/claude-code-on-the-web)
- 2026년 2월 5일 여러 세션이 서로 조율하는 에이전트 팀이 연구 미리보기로 나왔고, 2월 24일에는 휴대폰에서 로컬 세션을 잇는 Remote Control이 나왔다. [Anthropic](https://www.anthropic.com/news/claude-opus-4-6), [Claude 게시물](https://x.com/claudeai/status/2026418435408986423)
- 3월 24일 분류기가 사람 대신 권한을 판단하는 자동 모드가 나왔고 7월 10일 전체 사용자에게 열렸다. 4월 14일에는 노트북 없이 일정, API, GitHub 이벤트로 도는 routines가 나왔다. [자동 모드](https://claude.com/resources/articles/auto-mode), [routines](https://claude.com/blog/introducing-routines-in-claude-code)

기록할 수 있는 문장: “Anthropic, Agent Skills를 공개 표준으로 내놓았고 OpenAI도 Codex 문서에 추가.” / “Claude Code, 브라우저에서 맡기면 클라우드에서 작업하는 기능 공개.” / “Anthropic, 사람이 없어도 일정과 이벤트로 도는 Claude Code routines 공개.”

기존 장면: `2025-02-vibe-coding`, `2025-05-coding-agents` (각 4개)는 공개와 정식 출시까지만 다룬다. `2026-09-always-on` (4개)은 다른 회사의 상시 에이전트를 다룬다. 새 장면을 제안하며 4개 항목은 Claude Code on the web, Agent Skills 표준, 에이전트 팀, routines를 권한다. 자동 모드는 routines 대신 넣을 수 있다. 주제는 `agents`를 제안한다.

영어 표기: Agent Skills, Claude Agent SDK, Claude Code on the web, agent teams, auto mode, routines, Remote Control은 용어집에 없다. 출처는 위 Anthropic 원문이다.

주의: 가장 강한 근거는 다른 회사가 따라간 Agent Skills다. 나머지는 한 회사의 기능 목록이라 “흐름을 바꾼 사건” 기준에는 약하고 독립 사용량 자료가 없다. 에이전트 팀은 실험 기능이고 기본값이 꺼져 있다. 자동 모드는 위험을 줄일 뿐 없애지 않는다고 Anthropic이 밝혔다. 훅과 서브에이전트 날짜는 npm 배포일이다. Remote Control 날짜는 출처마다 하루 차이가 난다. “30개 이상 도구가 채택”이라는 수치는 확인되지 않아 쓰지 않는다.

### 6. Jev와 결정 모델, 9월 15일~10월 6일

- TypeSafe AI는 9월 15일 글 대신 타입이 정해진 확률적 결정을 돌려주는 Jev를 일부 공개로 내놓고 4,000만 달러 시드 투자를 발표했다. 입력 100만 토큰당 0.042달러이고 출력 토큰은 무료다. [TypeSafe](https://typesafe.ai/blog/introducing-system-one-models-and-jev), [The Register](https://www.theregister.com/ai-and-ml/2026/09/16/typesafe-ai-debuts-model-for-machines-that-plays-doom/5296711)
- Amazon의 Strands Decider 2B와 Cloudflare의 Clef가 10월 1일 나왔다. 둘 다 Apache 2.0 공개 가중치다. [Startup Fortune](https://startupfortune.com/amazon-releases-its-own-jev-clone-as-the-ai-decision-model-race-turns-into-a-pile-up/), [Startup Fortune](https://startupfortune.com/cloudflare-open-sources-clef-to-challenge-openai-and-amazon-on-ai-agent-decisions/)
- OpenAI는 10월 6일 GPT-6 Luna 기반 Decisions API를 공개 베타로 열었다. [OpenAI Developers 게시물](https://x.com/OpenAIDevs/status/2107573382229188645)

기록할 수 있는 문장: “TypeSafe AI, 글을 생성하지 않고 결정만 돌려주는 모델 Jev를 공개.” / “OpenAI, 같은 방식의 Decisions API를 공개 베타로 출시.”

기존 장면: 없음. 주제는 `models`, `agents`를 제안한다.

영어 표기: TypeSafe AI, Jev, System One Model, Decisions API, Strands Decider, Clef는 용어집에 없다. TypeSafe 표기는 위 원문에서 확인했고, Amazon과 Cloudflare는 작성 단계에서 원문을 확인한다.

주의: 속도와 비용은 회사 주장이고 독립 검증이 없다. The Register는 “환각이 없다”는 주장에 이의를 제기했다. 회사도 평가 과제를 자체 제작했고 가격이 보조금이 아니라고 증명할 수 없다고 적었다. 창업자 Diogo Almeida를 “ChatGPT 공동 창시자”로 쓰지 않는다. 8억 7,000만 달러 투자(Bloomberg 보도), OpenAI가 Jev에서 영감을 받았다는 발언은 2차 전언이라 넣지 않았다. Amazon, Cloudflare 항목은 질이 낮은 매체 위주로 봤으므로 원문 확인 전에는 쓰지 않는다.

### 7. Meta의 Muse Spark, 4월 8일

- Meta Superintelligence Labs는 4월 8일 Muse 시리즈의 첫 모델 Muse Spark를 공개했다. Meta AI 앱과 웹에 적용했고 API는 일부 협력사 비공개 미리보기로 제공했다. [Meta 발표](https://about.fb.com/news/2026/04/introducing-muse-spark-meta-superintelligence-labs-first-model-built-to-prioritize-people/)
- 가중치는 공개하지 않았고, 향후 버전을 오픈소스로 내고 싶다는 뜻만 밝혔다. [Meta 발표](https://about.fb.com/news/2026/04/introducing-muse-spark-meta-superintelligence-labs-first-model-built-to-prioritize-people/), [Bloomberg](https://www.bloomberg.com/news/articles/2026-04-08/meta-debuts-first-ai-model-from-prized-superintelligence-group)

기록할 수 있는 문장: “Meta, 초지능 연구소의 첫 모델 Muse Spark를 공개하고 가중치는 내놓지 않았다.”

기존 장면: `2026-09-always-on` (4개)에 Muse, `2026-09-open-weights` (4개)에 Muse Spark Open이 있다. `2026-04-mythos`도 4개다. 이 두 항목을 옮겨 Meta 장면 하나로 묶으면 3개가 되고, 옮긴 장면은 3개로 남아 규칙을 지킨다.

영어 표기: Muse Spark, Meta Superintelligence Labs는 용어집에 없다. 출처는 위 Meta 발표다.

주의: “Llama 폐기”로 쓰지 않는다. Meta는 Llama 중단을 이 발표에서 밝히지 않았고, 10월 15일에는 Muse Spark Open을 공개했다. 항목을 옮기면 두 기존 장면의 `updated`와 제목 적합성을 다시 봐야 한다.

### 8. LLM Wiki와 GBrain, 4월 4~5일

- Andrej Karpathy는 4월 4일 “LLM Wiki” 글을 공개했다. LLM이 마크다운 위키를 계속 쓰고 고치며, “Obsidian은 IDE, LLM은 프로그래머, 위키는 코드베이스”라고 설명한다. [Karpathy 글](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- Y Combinator CEO Garry Tan은 4월 5일 에이전트용 기억 시스템 GBrain을 MIT 라이선스로 공개했다. 별은 31,593개다. [GBrain 저장소](https://github.com/garrytan/gbrain)
- 주변 도구로 Obsidian 공식 CLI(1.12, 2월), Obsidian 메인테이너의 obsidian-skills(별 50,916개), Tobi Lütke의 qmd(별 30,931개)가 있다. [DEV](https://dev.to/shimo4228/obsidians-official-cli-is-here-no-more-hacking-your-vault-from-the-back-door-3123), [obsidian-skills](https://github.com/kepano/obsidian-skills), [qmd](https://github.com/tobi/qmd)

기록할 수 있는 문장: “Andrej Karpathy, LLM이 직접 쓰고 고치는 개인 위키 방식을 공개.” / “Garry Tan, 에이전트용 기억 시스템 GBrain을 오픈소스로 공개.”

기존 장면: 없음. 같은 계열로 `2026-01-ai-basic-act`에 OpenClaw가 있다. 주제는 `agents`를 제안한다.

영어 표기: LLM Wiki, GBrain, Obsidian, Garry Tan, Y Combinator는 용어집에 없다. 출처는 위 저장소와 글이다.

주의: 개발자 사이의 유행이고 사용자 수 같은 독립 자료가 없다. 별 수는 관심의 지표일 뿐 사용량이 아니다. “조회수 1,600만”류의 수치는 출처마다 달라 쓰지 않는다. Obsidian CLI 날짜는 2차 출처 기준이라 공식 변경 기록을 확인해야 한다.

### 추가. Claude Cowork, 1월 12일~9월 16일

- Anthropic은 2026년 1월 12일 “Claude Code for the rest of your work”라는 설명으로 Cowork 연구 미리보기를 공개했다. 허용한 폴더의 파일을 읽고 고치고 만든다. 처음에는 macOS 앱의 Max 요금제 전용이었고 1월 16일 Pro로 넓혔다. [Simon Willison](https://simonwillison.net/2026/Jan/12/claude-cowork/), [The Register](https://www.theregister.com/2026/01/13/anthropic_previews_claude_cowork_for/)
- 1월 30일 Cowork에 플러그인 11종이 추가됐고, 2월 3일 Thomson Reuters가 18% 가까이, RELX가 14% 내렸다. [LawSites](https://www.lawnext.com/2026/02/anthropics-legal-plugin-for-claude-cowork-may-be-the-opening-salvo-in-a-competition-between-foundation-models-and-legal-tech-incumbents.html), [Reuters 전재](https://finance.yahoo.com/news/anthropics-ai-tools-deepen-selloff-054551832.html)
- 9월 16일 Anthropic은 Cowork와 채팅을 하나의 Claude로 합친다고 발표했다. Pro, Max, Ultra부터 적용했고 10월 23일 Enterprise에 정식 제공했다. [Anthropic](https://claude.com/blog/cowork-is-now-claude)

기록할 수 있는 문장: “Anthropic, 파일을 직접 다루는 비개발 업무용 에이전트 Claude Cowork를 연구 미리보기로 공개.” / “Anthropic, Cowork용 플러그인 11종을 깃허브에 공개.”

기존 장면: `2026-02-saaspocalypse` (4개). 1번째 항목은 “업무용 Claude 플러그인 11종”이라고만 적어 Cowork가 빠져 있다. 이 문장을 고치고 `updated`를 넣는다. 항목을 더 넣을 수는 없으므로 Cowork 공개는 후보 5 장면에 넣는다. 그 장면의 4개 항목은 web, Agent Skills, Cowork, routines를 권한다. 에이전트 팀은 실험 기능이고 기본값이 꺼져 있어 뺀다.

영어 표기: Claude Cowork는 용어집에 없다. 출처는 [Anthropic 제품 페이지](https://claude.com/product/cowork)다.

주의: Anthropic의 1월 원문 글은 찾지 못해 Simon Willison과 The Register의 인용으로 확인했다. 2월 급락을 Cowork 하나의 결과로 쓰지 않는다. Reuters는 기존 매도세를 키웠다고 전했고 분석가 의견도 갈렸다. “약 열흘 만에 개발”은 직원의 방송 발언을 VentureBeat가 전한 것이고, Claude Code가 대부분을 만들었다는 말은 익명 전언이라 쓰지 않는다. 4월 9일 전체 유료 요금제 제공은 2차 출처 기준이다. Anthropic은 프롬프트 주입 위험이 남아 있다고 공지했다.

## 후보로 올리지 않은 소재

- 나노 바나나: 이미 있다.
- Y Combinator: 지분 조건, 배치 구조, 대표 교체 같은 구조 변화를 찾지 못해 사용자가 제외했다.
- Claude Code의 연환산 매출(2026-02-12, 25억 달러 초과)과 소스 코드 유출(2026-03-31, Anthropic은 사람의 실수로 생긴 배포 문제라고 설명): 기능 변화가 아니어서 뺐다. [Anthropic](https://www.anthropic.com/news/anthropic-raises-30-billion-series-g-funding-380-billion-post-money-valuation), [The Register](https://theregister.com/2026/03/31/anthropic_claude_code_source_code)
