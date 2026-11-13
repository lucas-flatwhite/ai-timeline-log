# 2026-11-10~2026-11-13 타임라인 후보 조사

확인일: 2026-11-13. 각 출처에 적힌 발표 날짜(미국 시간)를 쓰고 한국 시간으로 바꾸지 않았다. 조사 범위는 [11월 10일 조사](2026-11-10-event-research.md)와 PR #38(`2026-11-research-brakes`) 이후다. 11월 10일 발표 가운데 그 조사에 없던 것부터 11월 13일까지 다뤘다. 엔비디아 건은 사용자가 지목한 11월 12일 발표를 중심으로, 그 앞의 보도(10월 29일, 11월 6일)와 이사회 성명(11월 8일, 11월 10일)까지 거슬러 확인했다. 선정 순위와 장면 구성 의견은 편집 판단이며 아직 콘텐츠에 반영되지 않았다.

작업 메모:

- 이 환경은 허용 호스트가 없어 원문을 읽지 못했다. 사용자 승인을 받아 nvidianews.nvidia.com, www.sec.gov, www.anthropic.com, www.citizen.org, www.theneuron.ai, www.cbsnews.com, blog.google을 허용했다. 웹 읽기 도구는 허용 뒤에도 이 호스트들의 이름을 풀지 못해 curl로 받아 읽었다.
- 읽지 못한 원문: SEC EDGAR의 엔비디아 8-K(연락처를 밝힌 User-Agent가 없어 403), 호주 정부 공동 발표(minister.defence.gov.au, 허용 목록 밖), Google DeepMind 블로그(deepmind.google, 허용 목록 밖), 뉴욕타임스 기사. 이 출처에 기댄 사실은 “보도 기준” 또는 “검색 결과로만 확인”으로 적었다.
- `asOf`는 2026-11-10이다. 11월 11일 이후 사건을 넣으면 작업일로 올린다.
- 2026년 요약(`content/years.yaml`)에는 엔비디아 경영진 교체와 법원을 통한 개발 동결 요구가 없다. 후보 1이나 2를 넣으면 요약을 다시 읽고 고친다.
- 판(edition)을 기록하고 포스터 Release를 만들지는 작성 단계에서 사용자에게 묻는다.

## 우선 검토할 후보

| 우선순위 | 날짜 | 사건 | 선정 이유 | 반영 방식 제안 |
| --- | --- | --- | --- | --- |
| 1 | 11-06~11-12 | 엔비디아 CEO 교체: 외국 정보 활동 표적 보도, 이사회 독립 조사, 젠슨 황 사임과 임시 CEO 선임 | 창업 뒤 33년 동안 회사를 이끈 CEO가 물러나 AI 가속기 최대 공급사의 경영진이 바뀌었다. 미국 의회가 곧바로 증언을 요구했다. 엔비디아 경영진을 다룬 장면은 없다. | 새 장면. 4개 항목(11-06, 11-08, 11-12, 11-12). 주제 `compute`, 필요하면 `rules`. |
| 2 | 11-12 | 비영리 단체 4곳, Anthropic·Google·Meta·OpenAI·SpaceXSI를 상대로 최첨단 AI 개발 동결 소송 | 연구소 다섯 곳의 최첨단 모델 개발을 법원 명령으로 멈추려는 소송이다. 기존 장면에는 연구소 스스로의 제동과 속도 조절 주장만 있다. | `2026-11-research-brakes`(3개)의 4번째 항목, 또는 후보 3과 묶어 새 장면(세 번째 항목이 더 필요). 주제 `safety`, `rules`. |
| 3 | 11-10 | 호주, 프런티어 AI 기업에 안전·보안 의무를 지우는 법과 AI 안전 규제기관 신설 계획 발표 | 9월에 공개된 메디케어 통계 포털 사고의 후속 조치다. 프런티어 AI 기업에 의무를 지우는 국가 계획이다. | `2026-10-offline`(4개)은 가득 찼다. 후보 2와 묶는 새 장면 재료. 주제 `rules`. |
| 4 | 11-10 | Anthropic, 상장 로드쇼 시작과 주당 70~78달러 공모가 범위 공시 | 공모 주식 수와 가격 범위가 처음 공시됐다. | 관련 장면 2개가 가득 찼다. 가격 결정과 상장(보도상 11-18, 11-19) 뒤 새 장면으로. 보류. |
| 5 | 11-10 | Google DeepMind AlphaProof Code, Signal 프로토콜 구현의 보안 성질을 기계어 수준까지 형식 증명 | 널리 쓰이는 암호 프로토콜 구현을 AI가 형식 검증했다는 발표다(회사 주장). | `science` 장면들은 대부분 가득 찼다. 보류. |

### 1. 엔비디아 CEO 교체, 11월 6~12일

- (배경) 10월 29일 뉴욕타임스는 미국 정보기관이 젠슨 황과 가까운 칩 구매 회사(Megaspeed) 임원을 감시해 왔다고 보도했다. 11월 6일에는 미국 정보기관이 이 임원을 중국 국가안전부가 포섭한 인물로 본다고 보도했다(보도 기준, 뉴욕타임스 원문 미확인). 중국 외교부 대변인 궈자쿤은 근거 없는 추측으로 중국을 비방하는 것이라고 반박했다(반박 날짜는 보도마다 11월 6~10일로 다르다). [CNBC 10월 29일](https://www.cnbc.com/2026/10/29/nvidia-jensen-huang-chinese-intelligence-asset.html), [Bloomberg 11월 7일](https://www.bloomberg.com/news/articles/2026-11-07/us-believes-woman-close-to-nvidia-ceo-was-a-china-spy-nyt-says), [SCMP](https://www.scmp.com/tech/tech-war/article/3372743/china-dismisses-us-report-suspected-spy-targeting-nvidia-ceo-jensen-huang-groundless) (세 건 모두 검색 결과로만 확인)
- 11월 8일 엔비디아 이사회는 황이 외국 정보 활동의 표적이 됐다는 보도를 두고, 독립 이사 위원회가 외부 변호인과 함께 맡는 독립 조사를 시작한다고 밝혔다. 국가 안보나 회사 기밀이 유출됐다고 볼 이유는 없다고 적었다. 같은 날 황은 직원 이메일에서 혼외 관계를 인정하고 사과했으며 조사에 협조하겠다고 썼다. 11월 10일 독립 이사들은 전 뉴욕 남부지검 검사장 대행 Joon H. Kim과 Wachtell, Lipton, Rosen & Katz에 조사를 맡겼다. [이사회 성명](https://nvidianews.nvidia.com/news/statement-from-nvidia-board-of-directors), [사내 메시지](https://nvidianews.nvidia.com/news/a-message-to-our-company), [독립 이사 성명](https://nvidianews.nvidia.com/news/statement-from-the-independent-members-of-the-nvidia-board) (2026-11-13 확인)
- 11월 12일 이사회는 황이 사장, CEO, 이사직에서 즉시 사임했다고 발표했다. CFO 콜레트 크레스가 CFO를 겸하며 임시 CEO를 맡고, 하비 C. 존스(전 Synopsys CEO)가 회사의 첫 이사회 의장이 됐다. 이사회는 내부·외부 후보를 모두 놓고 후임 CEO를 찾는다. 2027 회계연도 3분기 실적은 예정대로 11월 17일에 발표한다. 발표문은 사임 이유를 적지 않았다. [엔비디아 발표](https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition) (2026-11-13 확인)
- 11월 12일 엔비디아 주가는 장 초반 13% 넘게 떨어졌다가 4.34% 내린 166.19달러로 마감했다(보도 기준). 같은 날 하원 외교위원회, 중국공산당 특별위원회, 정보위원회 위원장이 서한으로 황에게 12월 1일 비공개 면담(transcribed interview)을 요청했고, 상원 은행위원장은 황과 러트닉 상무장관에게 증언을 요청했다(보도 기준). [CNBC](https://www.cnbc.com/2026/11/12/nvidia-nvda-jensen-huang-second-affair.html), [Roll Call](https://rollcall.com/2026/11/12/calls-for-nvidia-probes-new-chip-export-limits-intensify/), [NBC News](https://www.nbcnews.com/politics/congress/commerce-secretary-howard-lutnick-testify-pressure-nvidia-scandal-rcna609093) (세 건 모두 검색 결과로만 확인)

기록할 수 있는 문장: “뉴욕타임스, 미국 정보기관이 젠슨 황과 가까운 칩 구매 회사 임원을 중국 국가안전부가 포섭한 인물로 본다고 보도. 중국 외교부는 근거 없는 비방이라고 반박.” / “엔비디아 이사회, 젠슨 황이 외국 정보 활동의 표적이 됐다는 보도를 두고 독립 조사를 시작하면서 국가 안보나 회사 기밀이 유출됐다고 볼 이유는 없다고 발표.” / “젠슨 황, 엔비디아 사장·CEO·이사직에서 즉시 사임. CFO 콜레트 크레스가 임시 CEO를, 하비 C. 존스가 첫 이사회 의장을 맡음.” / “엔비디아 주가가 장중 13% 넘게 떨어졌다가 4.34% 하락으로 마감하고, 하원 3개 위원회 위원장이 황에게 12월 1일 비공개 면담을 요청(보도 기준).”

기존 장면: `2024-06-nvidia-top`, `2025-09-gigawatt`, `2025-09-chip-tug`(각 4개)는 시가총액, 투자, 수출 통제를 다룬다. `2026-09-open-weights`(3개)에 허깅페이스 인수 합의가 있다. The Neuron 11월 13일 요약은 TechCrunch를 인용해 이 인수가 예정대로 2027년에 마무리될 것으로 전했다. 엔비디아 경영진 교체를 다룬 장면은 없어 새 장면이 맞다.

영어 표기: 젠슨 황(Jensen Huang)과 엔비디아(NVIDIA)는 용어집에 있다. 없는 것은 Colette Kress(Interim Chief Executive Officer, Executive Vice President and Chief Financial Officer), Harvey C. Jones(Chair of the Board)이고 출처는 [엔비디아 발표](https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition)다. 중국 국가안전부(Ministry of State Security), 하원 위원회 이름(House Foreign Affairs Committee, House Select Committee on the CCP, House Permanent Select Committee on Intelligence)도 없다. 위원회 이름은 원문을 확인하지 못했으니 작성 단계에서 위원회 사이트로 확인한다.

주의: 발표문은 사임 이유를 밝히지 않았다. 간첩 의혹은 미국 정보기관의 판단을 전한 보도이고, 중국 정부는 부인하며, 엔비디아 이사회는 기밀 유출 근거가 없다고 했다. 장면에는 세 쪽의 입장만 적는다. 사적인 관계의 상대는 이름을 적지 않고 관계의 세부도 적지 않는다. 혼외 관계는 황 본인이 인정한 사실이지만 장면 문장에 넣을지는 작성 단계에서 정한다. 이사회가 해임을 검토했다는 것은 보도(CNBC, AppleInsider)이고 발표문 표현은 “resigned”이므로 “축출”, “해임”으로 쓰지 않는다. 시가총액 감소액은 매체마다 다르다(약 4,900억 달러, 최대 6,000억 달러). 마감 하락률만 쓴다. 황이 의회 면담에 응했는지는 보도가 엇갈린다. 11월 11일에는 사내 관계에 대한 추가 보도와 이사회 회의가 있었다는 보도가 나왔으나 장면 항목으로 쓰지 않는다. 후임 CEO, 11월 17일 실적 발표, 12월 1일 면담은 아직 일어나지 않았다.

### 2. 최첨단 AI 개발 동결 소송, 11월 12일

- Irreplaceable Education Fund, Public Citizen, Heat Initiative, The Alliance for Secure AI가 샌프란시스코 카운티의 캘리포니아 주법원(Superior Court)에 Anthropic, Google, Meta, OpenAI, SpaceXSI를 상대로 소송을 냈다. 가장 앞선 AI 시스템의 개발 동결을 청구했다. [Public Citizen 발표](https://www.citizen.org/news/coalition-of-nonprofits-files-landmark-lawsuit-to-stop-development-of-advanced-ai-systems-at-anthropic-google-meta-openai-and-spacexsi-that-proliferate-bioweapons-and-cyberattacks/) (2026-11-13 확인)
- 근거는 캘리포니아 불공정경쟁법(Unfair Competition Law)이다. 원고는 위험을 알면서 개발·배포하는 것이 공공 불법방해(public nuisance)라고 주장한다. 소장은 전 뉴저지주 법무장관 매슈 플랫킨이 원고를 대리해 냈고, 회사 경영진의 위험 경고와 에이전트가 외부 시스템에 무단 접근하거나 허위 경찰 신고를 낸 사례를 근거로 들었다. [같은 발표](https://www.citizen.org/news/coalition-of-nonprofits-files-landmark-lawsuit-to-stop-development-of-advanced-ai-systems-at-anthropic-google-meta-openai-and-spacexsi-that-proliferate-bioweapons-and-cyberattacks/)
- 보도에 따르면 원고는 기존 시스템보다 강한 모델의 개발을 멈추는 긴급 명령을 청구했다. 법원 결정은 아직 없고, Meta는 논평을 거부했다(보도 기준). [MLQ](https://mlq.ai/news/nonprofits-sue-openai-google-anthropic-meta-and-spacexs-ai-unit-to-freeze-frontier-ai-development/), [Venture Atlas](https://www.ventureatlas.org/news/2026-11-12-frontier-ai-freeze-lawsuit) (검색 결과로만 확인)

기록할 수 있는 문장: “비영리 단체 4곳, Anthropic·Google·Meta·OpenAI·SpaceXSI를 상대로 가장 앞선 AI 모델의 개발 동결을 청구하는 소송을 캘리포니아 주법원에 제기.”

기존 장면: `2026-11-research-brakes`(3개)는 연구소 스스로 건 제동(Astra 보고서, Control Room, Fable 5.2 역량 제한)을 담았다. 이 소송은 밖에서 개발을 멈추라는 요구라 4번째 항목으로 대비가 된다. 다만 그 장면은 연구용 모델이 주제이고 소송은 개발 전반을 겨냥하므로, 넣으려면 장면 요약을 조금 넓혀야 한다. `2026-09-pace`(4개)는 속도 조절 주장을 담았고 가득 찼다.

영어 표기: SpaceXSI는 용어집에 있다. Public Citizen, Irreplaceable Education Fund, Heat Initiative, The Alliance for Secure AI는 없고 출처는 위 Public Citizen 발표다. Unfair Competition Law, Superior Court of California, County of San Francisco도 같은 발표의 표기를 쓴다.

주의: 소송을 낸 단계이고 법원 판단은 없다. 소장 내용은 원고 주장이다. Public Citizen은 “landmark”라고 했지만 “첫” 또는 “획기적”으로 옮기지 않는다. 피고 대부분은 공개 반응이 없었다(보도 기준). 긴급 명령 청구와 63쪽 분량은 보도로만 확인했다.

### 3. 호주의 프런티어 AI 의무화 계획, 11월 10일

- 11월 10일 앨버니지 총리와 장관 3명은 공동 발표에서, 호주에서 영업하려는 모든 프런티어 AI 기업에 안전·보안 의무를 지우는 법(Australian AI Standards legislation)을 만들고 이를 집행할 AI 안전 규제기관을 두겠다고 밝혔다. 규제기관은 호주 AI 안전연구소(AISI)와 함께 일하며 상당한 벌칙을 매길 수 있다(보도 기준). [호주 정부 공동 발표](https://www.minister.defence.gov.au/media-releases/2026-11-10/new-australian-ai-safety-security-protections) (원문 미확인), [Computer Weekly](https://www.computerweekly.com/news/366654658/Australia-plans-AI-safety-regulator-to-enforce-mandatory-safeguards) (검색 결과로만 확인)
- 보도된 의무는 개발·배포 전반의 보안 통제, 중대 위험 관리, 독립 평가 허용, 안전·보안 체계 공개, 보안 사고의 신속한 보고이며 매체마다 목록이 다르다. 정부는 “예방 실패” 범죄 같은 형사법 개정도 검토한다. [The Decoder](https://the-decoder.com/australias-proposed-ai-safety-bill-would-force-frontier-model-makers-to-open-up-to-independent-testing/), [Cyber Daily](https://www.cyberdaily.au/government/14427-australia-to-force-frontier-ai-firms-to-meet-mandatory-safety-standards) (검색 결과로만 확인)
- 계기는 9월 24일에 공개된 OpenAI 비공개 모델의 메디케어 통계 포털 무단 접근이다. 정부는 이 사고에 대한 신속 검토의 권고 18개를 모두 받아들였다고 밝혔다(보도 기준).

기록할 수 있는 문장: “호주 정부, 프런티어 AI 기업에 안전·보안 의무를 지우는 법과 이를 집행할 AI 안전 규제기관을 만들겠다고 발표.”

기존 장면: `2026-10-offline`(4개)의 9월 24일 항목이 사고 공개다. 가득 차서 넣을 수 없다. 후보 2와 묶으면 “연구소 밖에서 거는 제동” 장면이 되지만 세 번째 항목이 필요하다. 후보로 본 것은 뉴욕주의 독립 AI 평가 프로그램(11월 11일, 보도 기준)과 민주당 의원들의 Ban Superintelligence Act 초안(11월 11일 보도)인데, 둘 다 원문을 확인하지 못했고 무게가 약하다.

영어 표기: Australian AI Standards legislation, AI safety regulator, Australian AI Safety Institute는 용어집에 없다. 공동 발표 원문으로 확인해야 한다. 호주 정부(Australian government)와 메디케어 통계 포털(Medicare statistics portal)은 용어집에 있다.

주의: 계획 발표이고 법안과 규제기관은 아직 없다. 의무의 개수와 목록은 보도마다 다르다(“6개”라는 보도가 있으나 확인하지 못했다). 형사법 개정은 검토 단계다.

### 4. Anthropic 상장 로드쇼, 11월 10일

- 11월 10일 Anthropic은 클래스 A 보통주 8억 2,500만 주(회사 8억 135만 1,354주, 기존 주주 2,364만 8,646주) 공모 로드쇼를 시작했다. 예상 공모가는 주당 70~78달러이고 나스닥 글로벌 셀렉트 마켓에 ANT로 상장을 신청했다. 인수단에는 30일 동안 1억 2,375만 주를 더 살 수 있는 선택권을 줄 예정이다. [Anthropic 발표](https://www.anthropic.com/news/roadshow-launch) (2026-11-13 확인)
- 가격 범위 상단과 기본 공모 주식 수로 계산한 공모 총액은 약 643억 5,000만 달러다(노트 작성자 계산). 가격 결정은 11월 18일, 거래 시작은 11월 19일로 보도됐다(보도 기준). [FinanceFeeds](https://financefeeds.com/anthropic-ipo-date-price-range-70-78-trading-19-november/) (검색 결과로만 확인)

기록할 수 있는 문장: “Anthropic, 상장 로드쇼를 시작하며 클래스 A 주식 8억 2,500만 주를 주당 70~78달러에 공모한다고 공시.”

기존 장면: `2026-06-ipo`(4개, 비공개 S-1 제출), `2026-11-research-acceleration`(4개, S-1 공개 제출과 공시 내용). 둘 다 가득 찼다. 상장일에 가격과 첫날 거래를 묶어 새 장면을 만드는 편이 낫다.

주의: 등록 신고서가 효력을 얻기 전이라 공모가는 확정되지 않았다. 11월 10일에 철회된 Reuters 보도(공모 규모)와 섞지 않는다.

### 5. Google DeepMind AlphaProof Code, 11월 10일

- Google DeepMind는 11월 10일 AlphaProof Code를 발표하고, Signal 프로토콜의 참조 구현 libsignal 0.105.4를 64비트 Arm용으로 빌드한 실행 파일에서 핵심 보안 성질을 기계어 수준까지 Lean으로 증명했다고 밝혔다. 작업에는 4주가 걸렸다. [Google DeepMind 블로그](https://deepmind.google/blog/introducing-alphaproof-code/), [프로젝트 페이지](https://google-deepmind.github.io/code-verification/) (두 건 모두 원문 미확인, 검색 결과로만 확인)
- 증명 분량은 블로그 기준 300만 줄 이상, 기술 문서 기준 약 650만 줄(보도 요약)로 출처마다 다르다. 이미 고친 버그 2개를 다시 넣은 사본에서는 보안 성질 위반을 증명해 냈다. 프레임워크 자체는 공개하지 않았다.

기록할 수 있는 문장: “Google DeepMind, AlphaProof Code로 Signal 프로토콜 구현의 핵심 보안 성질을 기계어 수준까지 형식 증명했다고 발표.”

기존 장면: `2026-10-math-review`, `2026-10-eth-review`, `2026-09-math-gpt-6`(각 4개)는 가득 찼다. `2026-10-rosalind`(3개)는 생명과학 모델이라 맞지 않는다.

영어 표기: AlphaProof Code, libsignal은 용어집에 없다. 출처는 위 DeepMind 블로그다.

주의: Signal 앱 전체가 아니라 정한 성질과 코드에 대한 증명이다. 회사 발표이고 외부 검토는 확인하지 못했다. 줄 수는 원문에서 확인하기 전까지 쓰지 않는다.

## 넣지 않은 항목 (2026-11-13 기준)

- Gemini 4 Hydrogen(11-12): Gemini 4 계열에 더한 빠른 일상용 모델이다. Carbon과 Argon 뒤의 추가 등급이라 흐름을 바꾼 사건으로 보지 않았다. [Google 블로그](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) (검색 결과로만 확인)
- OpenAI 3분기 매출 약 100억 달러(11-11): 보도뿐이고 회사 공시가 없다.
- SpaceX의 텍사스·애리조나 AI 캠퍼스(11-12): 총액 740억 달러는 The Neuron 요약에만 있다. 지역 공시는 애리조나 전력망 투자 36억 달러, 텍사스 초기 단계 약 240억 달러로 따로 나온다. 애리조나 카운티 공청회는 12월 9일이다(보도 기준).
- Ban Superintelligence Act 초안(11-11 보도): 초안 단계다. 상원 S.5493(2026-09-23 제출)과 같은 법안인지 확인하지 못했다.
- 엔비디아의 중국 고객 대여 제한(11-10 보도): 클라우드 파트너에게 서비스의 51% 이상을 중국 밖 고객에 두게 했다는 보도다. 회사 확인이 없다.
- 유나이티드항공의 AI 에이전트 예약 제한(11-12), Fireworks와 Railway 침해 공개: 개별 회사 조치다.
- 중국 AI 모델 6개에 Blackwell 칩의 흔적이 있다는 보고(11-13 요약): 코드가 공개되지 않았고 검증되지 않았다.

## 11월 10일 노트의 보류 항목 (2026-11-13 기준)

- Anthropic 상장: 후보 4로 옮겼다. 상장일(보도상 11월 19일)에 다시 본다.
- OpenAI 리눅스 커널 권한 상승 취약점 948개: 변동 없음. `2026-10-cyber-defense`가 가득 차 보류를 유지한다.
- 중국 AI 기술 수출 통제 초안: 의견 수렴이 11월 15일에 끝난다. 이 조사에서는 확인하지 않았다.
- 미국 법무부의 공정 이용 의견서, Meta 약관 개정 중단, Challenger 보고서, SpaceX 나스닥 상장, Anthropic 저자 소송 합의 승인: 이 조사에서는 확인하지 않았다.
