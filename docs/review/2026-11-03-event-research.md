# 2026-10-30~2026-11-03 타임라인 후보 조사

확인일: 2026-11-03. 각 출처의 발표 날짜를 사용하며 한국 시간으로 일괄 변환하지 않았다. 11월 3일은 조사 시점까지 공개된 자료를 대상으로 한다. 아래 선정 순위와 장면 구성 의견은 편집 판단이다. 조사 후 사용자가 우선 후보 6묶음과 GPT-6 Rosalind를 선정했으며, 반영 결과는 [적용 기록](2026-11-03-scenes-and-boxes.md)에 정리했다.

공식 발표, 규제기관 문서, SEC 공시, 연구자 원문을 직접 확인했다. 뉴스 요약 사이트는 후보를 찾는 데 사용했으며, 확인된 사실의 근거는 아래 1차 출처로 한정했다. 회사의 성능 주장과 향후 계획은 독립 검증된 결과와 구분했다.

## 우선 검토할 후보

| 우선순위 | 날짜 | 사건 | 선정 이유 | 반영 방식 제안 |
| --- | --- | --- | --- | --- |
| 1 | 10-30 | OpenAI·Google의 공통 AI 학습 선호 신호 지원 계획과 영국 CMA의 Meta 조사 개시 | 웹 콘텐츠를 학습에 쓰는 조건이 기술 표준과 경쟁법 양쪽에서 다뤄졌다. | 학습 통제에 관한 새 장면 후보. 두 회사 발표와 CMA 조사를 3개 항목으로 구성 가능. |
| 2 | 11-02 | Anthropic, AI가 연구 개발을 가속하는 자체 기준에 임박할 수 있다고 공시 | 연구소의 속도 조절 논의가 투자자 대상 위험 공시에 구체적으로 등장했다. | 기존 9월 속도 조절 장면의 후속 후보. |
| 3 | 10-30 | Google, 우주 TPU에서 Gemma 4 응답을 수신했다고 발표 | 우주 AI 계산 구상이 실제 궤도 추론 시험으로 진행됐다. | 새로운 계산 인프라 장면의 핵심 후보. |
| 4 | 11-02 | Marvell, 기업가치 1,150억 달러 규모 Lumentum 인수 계약 발표 | AI 인프라의 광학 연결 기술을 중심으로 큰 기업 결합이 추진됐다. | 계산력과 자본 장면 후보. |
| 5 | 10-30 | Harvard CMSA 수학·AI 정상회의 보고서 공개 | AI 증명의 생산량에 대응해 평가, 공로 인정, 형식화와 연구소의 책임을 다뤘다. | 기존 수학 검증 흐름을 보완할 후보. |
| 6 | 11-03 | 영국 NCSC, AI 악성코드가 핵심 기반시설 랜섬웨어 공격에 쓰일 위험을 경고 | AI 사이버 능력을 국가 기반시설 위험으로 다룬 공식 평가다. | 기존 사이버 방어 장면의 4번째 항목 후보. |

### 1. 웹사이트의 AI 학습 통제, 10월 30일

- OpenAI는 웹사이트가 여러 AI 제공자에게 학습 선호를 한 번에 알리는 `robots.txt` 공통 신호를 존중하겠다고 발표했다. 수개월 내 구현을 목표로 하며 기존 크롤러 제어도 유지한다. [OpenAI 발표](https://openai.com/index/helping-websites-express-ai-training-preferences/)
- Google도 IETF AIPREF 작업을 바탕으로 공통 신호를 지원할 계획을 발표했다. 지원 목표는 2027년이며 `Google-Extended`를 명시한 기존 제어와 함께 작동하도록 설명한다. [Google Search Central 발표](https://developers.google.com/search/blog/2026/10/ai-training-control)
- 영국 CMA는 Meta의 기업 이용약관이 출판사 등의 웹 콘텐츠를 AI 등에 사용하는 데 불공정한 조건을 부과하는지 경쟁법 조사를 시작했다. Meta는 10월 28일 약관 도입을 일시 중단하고 업계 협의를 진행하겠다고 발표한 상태다. 위법 여부는 결정되지 않았다. [CMA 보도자료](https://www.gov.uk/government/news/cma-opens-investigation-into-metas-commercial-terms--2), [사건 페이지](https://www.gov.uk/cma-cases/suspected-abuse-of-a-dominant-position-in-relation-to-metas-commercial-terms)

기록할 수 있는 문장: “OpenAI와 Google이 웹사이트의 AI 학습 선호를 알리는 공통 신호를 지원하겠다고 발표했고, 영국 CMA는 Meta의 콘텐츠 이용약관에 대한 경쟁법 조사를 시작했다.”

주의: 표준 확정이나 전면 시행, 학습 데이터의 소급 삭제를 뜻하지 않는다. CMA 사건은 조사 개시이며 위법 판정이 아니다. 기존 `2025-06-23-fair-use.yaml`의 법원 판단과도 구분한다.

### 2. Anthropic의 AI 연구 가속 공시, 11월 2일

Anthropic의 S-1/A는 미래 모델에 관한 내부 추정과 기대를 근거로, AI에 의한 연구 진전의 가속이 자체 Responsible Scaling Policy 기준에 곧 도달할 수 있다고 설명한다. 동시에 현행 모델 중 기준을 넘었다고 지정한 모델은 없다고 명시한다. 가속을 사후에야 인지한 적이 있다는 설명도 있다. [SEC S-1/A, Risk Factors, 본문 29~30쪽](https://www.sec.gov/Archives/edgar/data/2130357/000162828026068676/anthropicpbc-sx1ax1.htm)

같은 공시는 계산·인프라 중심의 구매·임차 약정 총액 약 8,954억 달러를 기재한다. 대부분은 장기간에 걸친 약정이며, 일부는 2045년까지 집행될 예정이다. 같은 날 지출한 현금이나 전액 확정된 부채로 표현하면 안 된다. 위 SEC 공시의 Contractual Obligations에서 조건부·해지 가능 약정도 구분한다.

기록할 수 있는 문장: “Anthropic은 상장 등록서 수정본에서 미래 모델이 AI 연구 가속의 자체 기준에 임박할 수 있다고 밝혔고, 현행 모델이 그 기준을 넘었다고 지정하지는 않았다.”

주의: 재귀적 자기 개선의 달성, 자율적으로 후속 모델을 만드는 능력의 입증, AGI 선언으로 확대하지 않는다. 9월의 `2026-09-22-pace.yaml`은 이미 사건 4개이므로 그대로 덧붙일 수 없다. 후속 장면 구성이나 기존 항목 재편이 필요하다.

### 3. Project Suncatcher의 우주 추론 시험 발표, 10월 30일

Google은 10월 1일 발사한 Project Suncatcher 시제 위성의 데이터센터급 TPU에서 Gemma 4를 실행하고 지상으로 응답을 받았다고 발표했다. 다음 단계는 우주 방사선·열 조건에서의 시험이며, 2027년에는 연결된 위성 2기를 통한 시험을 계획한다. [Google 공식 발표](https://blog.google/innovation-and-ai/models-and-research/google-research/project-suncatcher-satellite-response/)

기록할 수 있는 문장: “Google은 Project Suncatcher 시제 위성의 TPU에서 Gemma 4를 실행해 지상으로 응답을 전송했다고 발표했다.”

주의: 10월 30일은 발표일이다. 본문은 시험 시점을 그 주로만 설명하므로 시험이 정확히 30일에 이뤄졌다고 단정하지 않는다. 상용 우주 데이터센터의 개통이나 경제성 입증도 아니다. 이 발표만으로 ‘인류 최초 우주 AI’라고 쓰지 않는다.

### 4. Marvell·Lumentum 인수 계약 발표, 11월 2일

Marvell은 Lumentum을 전액 주식 교환 방식으로 인수하는 계약을 발표했다. 발표 기준 Lumentum의 내재 기업가치(enterprise value)는 1,150억 달러이며, Lumentum 1주당 Marvell 주식 4.5주를 지급하는 조건이다. 양사는 전기·광학 연결, 레이저, 광회로 스위칭 등 AI 인프라용 기술의 결합을 제시한다. [양사 공동 발표](https://investor.lumentum.com/financial-news-releases/news-details/2026/Marvell-and-Lumentum-to-Combine-Creating-a-Category-Leader-in-AI-Connectivity/default.aspx)

계약 체결일은 11월 1일, 발표일은 11월 2일이다. [Lumentum 8-K](https://www.sec.gov/Archives/edgar/data/1633978/000119312526442758/d163169d8k.htm). 회사는 규제·주주 승인 등을 거쳐 2028년 상반기 종결을 예상한다. [Marvell의 공급사·파트너 안내 공시](https://investor.marvell.com/sec-filings/all-sec-filings/content/0001193125-26-443832/0001193125-26-443832.pdf)

기록할 수 있는 문장: “Marvell은 AI 인프라용 광학 연결 기술을 확대하기 위해 Lumentum을 기업가치 1,150억 달러 규모의 주식 교환 방식으로 인수하는 계약을 발표했다.”

주의: 인수 완료가 아니다. 1,150억 달러를 현금 지급액이나 단순 주식 시가총액으로 쓰지 않는다. 시너지와 성장 전망은 회사의 예상이다.

### 5. 수학·AI 정상회의 보고서 공개, 10월 30일

Harvard CMSA에서 10월 22~23일 열린 정상회의에는 학계·정부·산업계 수학자 32명이 참여했다. 주최자 5명이 10월 30일 Terence Tao의 블로그에 보고서를 소개했다. 보고서는 연구 평가와 채용에서 해설·데이터베이스·형식화 등 다양한 기여를 인정하고, 형식 증명을 기존 수학 실천의 보완으로 사용하며, AI 없이도 기여할 기회를 유지할 것을 권고한다. [주최자 원문, 공개일 확인](https://terrytao.wordpress.com/2026/10/30/__trashed/), [Harvard CMSA 보고서 PDF](https://cmsa.fas.harvard.edu/media/2026/10/Summit-on-Math-Research-in-the-Age-of-AI.pdf)

기록할 수 있는 문장: “수학자 32명이 참여한 Harvard CMSA 정상회의 주최자들이 AI 시대의 연구 평가와 공로 인정, 형식 증명 활용에 관한 권고문을 공개했다.”

주의: 회의 개최일과 보고서 공개일을 구분한다. 모든 수학자를 대표하는 구속력 있는 규칙이나 AI 증명의 일괄 승인으로 설명하지 않는다. `2026-10-06-math-review.yaml`은 이미 사건 4개다. 별도 장면에 충분한 사건이 모일 때까지 보류하거나 기존 항목 재편을 검토한다. ETH 증명의 검증 완료를 뜻하지 않는다.

### 6. NCSC의 AI 사이버 위협 평가, 11월 3일

NCSC는 2028년까지 AI 기반 악성코드가 영국 핵심 국가 기반시설에 대한 랜섬웨어 공격에 사용될 가능성이 매우 높다고 평가했다. AI가 기존 취약점 탐색과 사회공학, 공격 운영을 더 효율적으로 만들 수 있다는 경고다. [NCSC 발표](https://www.ncsc.gov.uk/news/cyber-chief-uk-facing-ai-powered-attacks-on-critical-infrastructure-in-two-years), [공식 연례 검토의 AI 위협 부분](https://www.ncsc.gov.uk/collection/annual-review-2026/understanding-threat/ai-impact-cyber-threat)

기록할 수 있는 문장: “영국 NCSC는 2028년까지 AI 악성코드가 핵심 국가 기반시설 대상 랜섬웨어 공격에 쓰일 가능성이 매우 높다고 경고했다.”

주의: 실제 공격 발생을 보고한 사건이 아니다. 일부 11월 2일 뉴스 요약에 등장하지만, 확인한 공식 발표와 연례 검토의 게시일은 11월 3일이다. `2026-10-21-cyber-defense.yaml`은 사건 3개라 추가 여지가 있지만, 추가한다면 기간·제목·서문도 함께 재검토해야 한다.

## 함께 검토할 후보

### GPT-6 Rosalind, 10월 30일

OpenAI API 변경 기록은 생물학 추론과 과학 도구 사용을 결합한 GPT-6 Rosalind의 출시를 10월 30일로 기재한다. 접근은 Rosalind Research 승인을 받은 조직의 내부 연구와 승인 사용자로 제한된다. [OpenAI API 변경 기록](https://developers.openai.com/api/docs/changelog), [접근 조건](https://help.openai.com/en/articles/20001193-gpt-rosalind-for-life-sciences-research)

의견: 생명과학 전문 모델이라는 점에서 후보가 된다. 다만 Rosalind 계열 자체의 최초 공개로 쓰면 안 되고, 승인 없는 일반 공개로 표현할 수도 없다. 계보는 대표 범용 모델을 대상으로 하며 전문 음성·영상 모델 등을 별도로 세지 않는다고 명시하므로, 생명과학 전문 모델도 범용 계보에 자동 추가하지 않는 편이 일관된다. 과학 장면을 확장할 때 우선 검토한다.

### LongCat-2.5, 11월 2일

Meituan 기술팀이 총 1.6조 파라미터, 토큰당 약 480억 활성 파라미터의 네이티브 멀티모달 모델을 발표했다. 장기 에이전트 작업과 시각 코딩을 내세우며 중국산 계산 인프라에서의 훈련·추론 최적화를 설명한다. 발표는 채팅과 API 접근 경로를 제공한다. [Meituan 기술팀 원문](https://tech.meituan.com/2026/11/02/Meituan-LongCat-2.5.html)

의견: 모델 경쟁·중국 계산 인프라 흐름의 후보. 수치와 성능은 회사 발표 기준이다. 가중치·라이선스 공개는 이 원문만으로 확인되지 않아 오픈 웨이트 출시로 기록하지 않는다. Meituan을 새 연구소로 계보에 넣을지는 대표 연구소의 선정 범위와 함께 결정해야 한다.

### Aramco의 HUMAIN 지분 49% 취득 완료, 11월 1일

Aramco와 PIF는 HUMAIN 거래 종결을 발표했다. PIF가 51%를 유지하고 Aramco가 49%를 취득하며, Aramco의 출자는 2026년 현금 약 26억 달러와 AI·계산·디지털 자산 이전으로 구성된다. 2030년 데이터센터 3GW는 계획이다. [Aramco 공식 발표](https://singapore.aramco.com/en/news-media/news/2026/pif-and-aramco-close-humain-transaction-to-accelerate-humains-global-growth)

의견: 기존 `2025-05-13-gulf.yaml`의 HUMAIN 인프라 투자 흐름을 잇는다. 거래 완료라는 점은 Marvell의 인수 계약 발표와 구분한다. ‘지분을 현금 26억 달러에 샀다’고만 쓰면 현물 출자가 빠진다.

### OpenAI Grid Protectors Program, 11월 2일

OpenAI는 전력망 부담이 큰 때 미래 계산 시설의 전력 사용을 줄이는 프로그램을 발표했다. Georgia Power와의 Effingham County 계획에는 최대 1,000MW 수요 반응이 포함된다. 시설은 아직 개발 중이다. [OpenAI 공식 발표](https://openai.com/index/grid-protectors-program/)

의견: 계산 인프라의 지역 전력 부담을 다룰 때 보충한다. 이미 1GW를 감축했다거나 가정 전기요금 인하가 실현됐다고 쓰지 않는다. 독립 사건의 우선순위는 Suncatcher·Marvell보다 낮다.

### DeepSeek dsh-superagent 연구 프로토타입, 10월 31일 저장소 생성

DeepSeek의 공개 GitHub 저장소 생성 시각은 `2026-10-31T09:32:46Z`다. README는 GitHub 저장소 하나를 대상으로 요청이나 허용된 규칙에 따라 작업하고 결과를 원래 대화에 돌려주는 코딩 에이전트라고 설명한다. [공식 조직 저장소](https://github.com/deepseek-ai/dsh-superagent-prototype), [README](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/README.md)

의견: 에이전트가 팀 작업에 참여하는 방식의 후보. 다만 저장소 생성 시각이 정확한 대외 공개 시각을 증명하지는 않는다. README는 정식 DeepSeek 제품이 아닌 연구 프로토타입이며 내부 구현·소개 글과 차이가 있고 일부 설계는 미구현이라고 명시한다. 정식 서비스 출시로 쓰지 않는다.

### CrowdStrike AI Kill Switch 발표, 11월 3일

CrowdStrike는 Falcon Guardian의 AI Kill Switch를 발표했다. 공식 설명은 Gateway에서의 종료 기능과 향후 endpoint 적용을 구분하며, AI Gateway는 일반 제공이라고 설명한다. Fiddler 인수도 완료가 아니라 추진 중인 거래로 표현한다. [CrowdStrike 공식 발표](https://crowdstrike.gcs-web.com/news-releases/news-release-details/crowdstrike-delivers-ai-security-and-safety-enterprise)

의견: 실행 중인 에이전트의 권한 통제를 다루는 보조 후보. 회사의 제품 주장만으로 모든 비인가 행동을 차단한다는 효과를 입증할 수 없다. NCSC 경고보다 우선순위는 낮다.

## 날짜와 범위 때문에 제외하거나 보류한 항목

- GPT-6.1 Terra: 공식 API 출시일은 10월 26일이다. 이번 날짜 범위 밖이며 기존 계보에 있다. [API 변경 기록](https://developers.openai.com/api/docs/changelog)
- Gemini 4 Carbon·Mistral Large 4: 로컬 타임라인에 각각 10월 28일 발표와 29일 가중치 공개로 이미 기록돼 있다. 이번 기간의 신규 사건으로 재사용하지 않는다.
- Anthropic 최초 공개 S-1 제출: 10월 26일 사건이다. 이번 후보는 11월 2일 수정 공시의 내용이다. 수정본 제출을 IPO 완료로 쓰지 않는다.
- Google의 11월 월간 요약: 게시일이 11월이라도 소개된 사건이 10월 말 이전이면 원래 사건 날짜로 다룬다.
- 모델 유출·차기 모델 임박 소문: 공식 모델 공개나 검증된 가중치 배포를 확인하지 못한 항목은 선정하지 않았다.
- 한국 자료도 검색했으나, 이번 조사에서 위 후보보다 우선할 범위 내 국내 사건은 선정하지 않았다. 예를 들어 11월 3일 게시된 성균관대 교육 모델 소개는 본문상 10월 26일 행사여서 범위 밖이다. [대학 사업단 게시물](https://aiuniv.skku.edu/aiuniv/Data.do?articleNo=227959&mode=view)

## 반영 순서 제안

1. 공통 학습 통제 신호와 CMA 조사를 새 장면으로 검토한다. 발표·예정·조사 개시를 구별하면 같은 날짜의 사건 3개를 확보할 수 있다.
2. Suncatcher와 Marvell을 중심으로 계산 인프라 후보를 검토한다. HUMAIN 지분 취득과 Grid Protectors는 함께 비교할 수 있지만, 자본·전력·우주 계산을 한 장면에 모두 묶을지는 서사의 초점에 따라 결정한다.
3. Anthropic 연구 가속 공시를 안전·속도 조절의 후속 사건으로 우선 확보한다. 수학 정상회의 보고서는 기존 수학 장면 재편에, NCSC 경고는 기존 사이버 장면 확장에 활용할 수 있다.
4. 모델 목록에는 전문 모델·범용 모델의 기존 선정 기준을 적용한다. Rosalind와 LongCat의 출시를 확인했다는 이유만으로 계보 범위를 넓히지 않는다.

이 문서는 조사 당시의 후보와 판단을 보존한다. 선정 이후의 콘텐츠 변경과 검증은 [적용 기록](2026-11-03-scenes-and-boxes.md)을 따른다.
