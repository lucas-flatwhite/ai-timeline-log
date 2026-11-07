# 2026-09-01~2026-11-06 타임라인 후보 조사

확인일: 2026-11-07. 각 출처의 발표 날짜를 사용하며 한국 시간으로 일괄 변환하지 않았다. 그래서 미국 증시 급락(11월 5일)과 코스피 서킷브레이커(11월 6일, 한국 시간)는 날짜가 다르다. 이 기간에는 이미 장면 14개가 들어가 있어, 기존 장면에 없는 사건을 찾는 데 조사를 집중했다. 아래 선정 순위와 장면 구성 의견은 편집 판단이며 아직 콘텐츠에 반영되지 않았다. 사용자는 2026-11-07에 이 노트에서 후보 4(METR)를 선정했으며, 함께 선정한 후보는 [요청 소재 조사](2026-11-07-requested-topics.md)에 정리했다. 나머지 후보는 같은 날 재검토했다. 결과는 아래 “재검토 결과” 절에 있다.

공식 발표, 규제기관 문서, 법원 제출 문서, 연구자 원문을 직접 확인했다. 뉴스 요약 사이트는 후보를 찾는 데만 사용했다. 시장 수치처럼 1차 문서가 없는 사실은 언론 보도를 근거로 하고 그렇게 표시했다. 일부 후보는 `asOf`(2026-11-03)보다 늦은 날짜이므로, 작성 단계에서 `content/site.yaml`의 `asOf`를 함께 올려야 한다.

## 재검토 결과

사용자가 2026-11-07에 후보 1(데이터센터)과 후보 2(Super Intelligence)를 선정해 장면으로 작성했다. 나머지는 보류한다.

- 후보 3(중국 수출 통제 초안): 확인된 사건이 하나뿐이다. 의견 수렴이 끝나는 11월 15일 뒤 확정 목록을 다시 본다.
- 후보 5(법무부 의견서): 판결이 나오면 그 사건과 함께 본다.
- 후보 6(Meta 약관 중단): `2026-10-training-controls`의 4번째 항목 후보로 남긴다.
- 후보 7(Challenger 보고서): 노동 장면을 다시 구성할 때 본다.
- SpaceX 나스닥 상장, Anthropic 저자 소송 합의 승인: 다음 조사에서 1차 출처로 확인한다.

작성하며 아래 내용이 이 노트와 달라졌다.

- 후보 1: Amazon 글에 날짜가 없어 항목 날짜를 `2026-10`으로 뒀다. 뉴욕주 유예 기간은 출처가 달라(주지사실은 최대 1년, Davis Polk는 고정 종료일 없음) 기간을 적지 않았다. 시장 수치는 Yahoo Finance의 반올림 수치(5.5%, 12%)를 썼다.
- 후보 2: 법무부 보도자료가 SI Force 의장을 직접 언급해 조직의 존재가 정부 문서로 확인됐다. 법적 근거 문서는 여전히 찾지 못했다. 캘리포니아 행정명령은 넣지 않았다.

## 우선 검토할 후보

| 우선순위 | 날짜 | 사건 | 선정 이유 | 반영 방식 제안 |
| --- | --- | --- | --- | --- |
| 1 | 11-03~11-06 | 데이터센터 주민투표 41건 중 40건이 제한 쪽으로 결정, 이틀 뒤 AI 관련주 급락 | 타임라인에 데이터센터 반대 흐름이 없다. 지역 투표와 시장 양쪽에서 건설 비용과 인허가가 쟁점으로 드러났다. | 새 장면. 뉴욕주 유예(7-14), Amazon NDA 중단(10-02), 주민투표(11-03), 급락(11-05)의 4개 항목. |
| 2 | 09-29~11-05 | 미국 행정부가 AI를 Super Intelligence로 바꿔 부르고 전담 조직을 세움 | 연방 정부의 용어와 조직이 바뀌었다. 기존 `2026-09-pace`에는 같은 날의 자율 협약만 있다. | 새 장면. 행정명령(09-29), SI Force(10-04), 법무부 태스크포스(11-05). 네 번째로 캘리포니아 행정명령(09-18) 가능. |
| 3 | 10-16 | 중국 상무부·과기부, 대규모 모델 등 AI 기술 23개 항목을 수출 금지·제한 목록에 넣는 초안 공고 | 칩을 통제받던 중국이 자국 AI 기술의 수출 통제를 제안했다. 임시 등록 의무는 공고일부터 적용된다. | 새 장면 후보. 관련 장면은 모두 4개라 추가 불가. 확인된 사건이 1개뿐이라 확정 목록 공고까지 보류하거나 재구성 필요. |
| 4 | 11-05 | METR, Anthropic의 모델 역량 향상 속도가 과거의 약 2배라고 평가 | 회사가 공시한 연구 가속을 외부 평가 기관이 내부 자료로 수치화했다. | `2026-11-research-acceleration`의 4번째 항목(지금은 3개). |
| 5 | 09-01 | 미국 법무부, 뉴욕타임스 소송에서 AI 학습이 공정 이용이라는 의견서 제출 | 저작권 쟁점에서 미국 정부가 한쪽 입장을 법원에 냈다. 판결은 아직 없다. | `2025-06-fair-use`는 4개라 추가 불가. 판결이 나올 때 새 장면으로 묶기를 권장. |
| 6 | 11-05 | Meta, 상업 이용약관 개정을 기한 없이 중단 | 기존 장면의 CMA 조사 이후 결과에 해당한다. | `2026-10-training-controls`의 4번째 항목(지금은 3개). 기존 3번째 항목과 일부 겹침. |
| 7 | 11-05 | Challenger 보고서, 2026년 누적 감원 사유 1위가 AI에서 시장·경제 여건으로 바뀜 | AI를 이유로 든 감원이 10월에 2026년 월간 최저로 내려갔다. | 우선순위 낮음. `2026-02-block-layoffs`는 4개라 추가 불가. 노동 장면을 다시 구성할 때 사용. |

### 1. 데이터센터 주민투표와 AI 관련주 급락, 11월 3~6일

- 뉴욕주지사는 7월 14일 행정명령으로 대형 데이터센터의 신규 재량 허가를 최대 1년 유예했다. 주 단위로는 처음이고, 대상은 50MW 이상이다. [주지사실 발표](https://www.governor.ny.gov/news/first-statewide-moratorium-new-hyperscale-data-centers-launched-governor-kathy-hochul), [Davis Polk 해설](https://www.davispolk.com/insights/client-update/new-york-state-enacts-data-center-moratorium)
- AWS CEO는 정부 기관과 NDA를 더는 쓰지 않는다고 밝히고, 데이터센터 지역사회에 5년간 10억 달러 이상을 투입하는 Built Together를 발표했다. 날짜는 10월 2일(보도 기준)이며 Amazon 글에는 날짜가 없다. [Amazon 발표](https://www.aboutamazon.com/news/company-news/amazon-data-centers-built-together), [TechCrunch](https://techcrunch.com/2026/10/03/amazon-responds-to-data-center-backlash-says-it-no-longer-uses-ndas/)
- 11월 3일 10개 주의 지역 주민투표 41건 중 40건이 데이터센터 개발을 제한하는 쪽으로 결정됐다. 전면 금지 5건, 부분 금지 12건, 6개월 유예 3건이 포함된다. 예외는 노스다코타주 하우드다. [Ballotpedia](https://news.ballotpedia.org/2026/11/06/voters-favored-limiting-data-center-development-in-40-of-41-local-ballot-measures-on-nov-3/), [Scientific American](https://www.scientificamerican.com/article/2026-election-results-show-widespread-opposition-to-ai-data-centers/)
- 11월 5일(목) 나스닥은 5.52%, 필라델피아 반도체지수는 12.25% 떨어졌다. Nvidia는 9.3%, AMD는 17.3%, Micron은 17.5% 내렸다. 분석가들은 민주당의 의회 장악 이후 규제와 건설 유예 위험을 이유로 들었다. [CNBC](https://www.cnbc.com/2026/11/06/ai-data-center-midterms-selloff.html), [Yahoo Finance](https://finance.yahoo.com/markets/live/stock-market-today-thursday-november-5-dow-sp-500-nasdaq-plunge-chip-stocks-melt-down-193726491.html)
- 11월 6일 코스피는 장중 8%대까지 떨어져 1단계 서킷브레이커가 발동됐고 6.02% 내린 5,059.69로 마쳤다. 2026년 들어 11번째 발동이다. [아시아경제](https://view.asiae.co.kr/article/2026110615475413854), [뉴스1](https://www.news1.kr/finance/market-exr/6345161)

기록할 수 있는 문장: “미국 10개 주의 지역 주민투표 41건 중 40건이 데이터센터 개발을 제한하는 쪽으로 결정됐다.” / “나스닥이 5.52%, 필라델피아 반도체지수가 12.25% 떨어졌고, 다음 날 코스피에 서킷브레이커가 발동됐다.”

기존 장면: 없음. `2024-09-nuclear`는 전력 조달, `2025-09-gigawatt`는 계약 규모를 다룬다. 주제는 `compute`, `society`를 제안하며 코스피 항목을 넣으면 `korea`도 가능하다.

영어 표기: Built Together, Executive Order No. 62, KOSPI는 용어집에 없다. 출처는 위 Amazon 발표와 주지사실 발표다. KOSPI는 작성 단계에서 한국거래소 표기를 확인한다.

주의: 투표는 대부분 시·군 단위이고 비구속 권고 투표도 포함되며, 집계는 비공식 결과 기준이다. 급락의 원인은 분석가의 해석이지 확정된 인과가 아니다. 10월부터 이어진 AI주 약세, 금리, 설비 투자 회의론, Qualcomm 실적 전망도 함께 거론됐다. 11월 4일(수)에는 시장 전체가 올랐고(다우 약 3% 상승), 11월 6일 미국 기술주는 일부 반등했다. 시장 수치는 언론 보도 기준이다.

### 2. 미국 행정부의 Super Intelligence 전환, 9월 29일~11월 5일

- 대통령은 9월 29일 행정명령 14434호에 서명했다. 연방 기관은 법이 허용하는 범위에서 공문서와 대외 소통에 “Artificial Intelligence” 대신 “Super Intelligence”(SI)를 쓴다. 법 조문, 계약, 기존 규정은 바꾸지 않으며, 연방 정의 입법안을 60일 안에 내도록 했다. [행정명령 원문](https://www.whitehouse.gov/presidential-actions/2026/09/inaugurating-the-era-of-super-intelligence/), [백악관 팩트시트](https://www.whitehouse.gov/fact-sheets/2026/09/fact-sheet-president-donald-j-trump-inaugurates-the-era-of-super-intelligence/)
- 대통령은 10월 4일 연방 차원의 조정 조직 Super Intelligence Force를 발표했다. 위원장은 Jay Clayton 국가정보국장이고, 구성원은 FTC 위원장, 전쟁부 연구공학 차관, 인사관리처장이다. 120일 안에 보고서를 내야 한다. [백악관 게시물](https://x.com/WhiteHouse/status/2106731532694028310), [AP 기사 전재](https://www.valleynewslive.com/2026/10/04/trump-names-national-intelligence-director-jay-clayton-lead-new-federal-ai-task-force/), [Crowell 해설](https://www.crowell.com/en/insights/client-alerts/white-house-announces-ai-responsibility-accord-executive-orders-and-super-intelligence-task-force)
- 법무부는 11월 5일 Super Intelligence Task Force(DOJ-SITF)를 세웠다. 외국 정부, 초국가 범죄 조직, 사기 등 불법 행위자의 SI 악용을 다루고, 기업에는 내부 통제와 위험 보고 강화를 요구한다. [법무부 보도자료 26-1319](https://www.justice.gov/opa/pr/department-justice-launches-super-intelligence-task-force)
- (네 번째 항목 후보) 캘리포니아 주지사는 9월 18일 행정명령으로 독립 감독 시행을 앞당기고, 프런티어 모델의 “kill switch”를 포함한 입법 권고를 두 달 안에 내도록 전문가 그룹에 지시했다. [주지사실 발표](https://www.gov.ca.gov/2026/09/18/governor-newsom-issues-executive-order-to-accelerate-independent-oversight-and-advance-the-creation-of-an-ai-kill-switch/)

기록할 수 있는 문장: “트럼프 대통령, 연방 기관이 AI 대신 ‘Super Intelligence’라는 용어를 쓰도록 하는 행정명령에 서명.” / “미국 법무부, SI 악용을 다루는 태스크포스 출범.”

기존 장면: `2026-09-pace` (4개). 네 번째 항목이 같은 날의 자율 협약과 규제 거부를 다루며 행정명령과 조직은 다루지 않는다. 주제는 `rules`를 제안한다. 캘리포니아 항목을 넣으면 `2025-12-state-laws`의 연방·주 갈등과도 이어서 읽을 수 있다.

영어 표기: Super Intelligence Force (SIF), Super Intelligence Task Force (DOJ-SITF), Executive Order 14434 “Inaugurating the Era of Super Intelligence”는 용어집에 없다. 출처는 위 원문과 보도자료다.

주의: 행정명령 14434호는 조직을 만들지 않는다. SI Force의 법적 근거 문서는 확인하지 못했고 대통령 게시물과 보도만 있다. 용어 변경은 비법정 문서에 한정되며 규제 내용을 바꾸지 않는다. DOJ-SITF는 새 범죄를 만들지 않는다. 캘리포니아 행정명령은 주 기관에 대한 지시이고 기업에 의무를 부과하지 않으며, “kill switch”는 검토 대상이다.

### 3. 중국의 AI 기술 수출 통제 초안, 10월 16일

- 상무부와 과기부는 공고 2026년 제48호에서 수출 금지·제한 기술 목록에 인공지능, 바이오의약, 태양광 기술 40개 항목을 추가하는 초안을 냈다. 의견 수렴은 11월 15일까지다. [공고 원문](https://www.mofcom.gov.cn/zwgk/zcfb/art/2026/art_0a31a3c9ac404f7a9b0e917ce3412997.html)
- AI는 23개 항목으로 대규모 모델, 에이전트, 계산 클러스터, 정보 처리를 포함한다. 목록이 시행될 때까지 해당 기술의 수출 전 임시 등록은 공고일부터 적용된다. [공고 원문](https://www.mofcom.gov.cn/zwgk/zcfb/art/2026/art_0a31a3c9ac404f7a9b0e917ce3412997.html)
- 오픈소스나 학술 발표로 공개된 기술은 제외하고, API, 앱, SaaS로 해외에 제공하는 것은 수출로 보지 않는다고 대변인이 설명했다. [상무부 대변인 답변](https://www.mofcom.gov.cn/syxwfb/art/2026/art_a4acff07e134447fbe7bbeb486df3ea6.html)

기록할 수 있는 문장: “중국 상무부와 과기부, 대규모 모델 등 AI 기술 23개 항목을 수출 금지·제한 목록에 넣는 초안을 공고하고 의견 수렴을 시작.”

기존 장면: `2026-09-distillation` (4개), `2026-04-manus` (4개). 둘 다 추가할 수 없다. 장면 하나에 3개 항목이 필요한데 이번 조사에서 1차 출처로 확인한 사건은 이 공고뿐이다. 주제는 `rules`, `compute`를 제안한다.

영어 표기: Ministry of Commerce (MOFCOM), Ministry of Science and Technology, Catalogue of Technologies Prohibited and Restricted from Export는 용어집에 없다. 공식 영문본은 확인하지 못했으므로 작성 단계에서 확인한다.

주의: 초안이며 목록은 시행되지 않았다. 시행 중인 것은 임시 등록뿐이다. 뉴스 요약에 나온 “11월 3일 공표”는 10월 16일 공고를 잘못 옮긴 것으로 보인다. 2조 파라미터, 10^26 FLOPs 같은 수치 기준은 2차 해설에만 있고 공고문과 대변인 답변에서 확인하지 못했다. 공고 첨부 목록(WPS 파일)을 읽기 전에는 쓰지 않는다.

### 4. METR의 Anthropic 연구 가속 평가, 11월 5일

- METR은 Anthropic이 잘 정의된 과제에서 모델 역량을 과거의 약 2배 속도로 높이고 있다고 평가했다. 내부 지표 기준 추정치는 1.9배(95% 신뢰구간 1.5~2.8배)이고 기준 기간은 2024년 3월~2025년 10월이다. [METR 보고서](https://metr.org/blog/2026-11-05-anthropic-ai-rd-acceleration-assessment/)
- METR은 2026년 10월 가속의 약 80%가 AI 덕분이라고 추측했고, 학습 계산량 증가가 원인은 아니라고 확신한다고 밝혔다. [METR 보고서](https://metr.org/blog/2026-11-05-anthropic-ai-rd-acceleration-assessment/)
- METR은 Anthropic 위험 보고서의 공개 표현 “2배 미만”에 대해, 비공개 수치를 합치면 1.97배가 나온다며 “약 2배”가 더 낫다고 제안했다. [METR 검토](https://metr.org/blog/2026-11-05-rd-section-anthropic-risk-report-august-2026-review/)

기록할 수 있는 문장: “METR, Anthropic의 모델 역량 향상 속도가 과거의 약 2배라고 평가.”

기존 장면: `2026-11-research-acceleration` (3개). 3번째 항목은 Anthropic 자체 공시이고, 이 항목은 외부 기관의 평가다.

영어 표기: METR은 용어집에 없다. 출처는 [metr.org](https://metr.org/).

주의: Anthropic과의 계약에 따른 작업이며(양측 간 비용 지급 없음), Anthropic이 일방적 삭제권을 가졌고 METR이 가장 유용하다고 본 증거의 대부분이 가려졌다. 약 80%는 METR의 주관적 추측이다. 잘 정의되고 자동 채점되는 과제에 쏠린 결과일 수 있고, 실제 영향과 같지 않다. Anthropic의 공식 반응은 찾지 못했다.

### 5. 미국 법무부의 공정 이용 의견서, 9월 1일

- 미국 정부는 뉴욕 남부연방지법의 OpenAI 저작권 병합 사건에 이해관계 의견서(Statement of Interest)를 냈다. 사건 번호는 25-md-3143이고 문서 번호는 316이다. [법원 제출 문서](https://fingfx.thomsonreuters.com/gfx/legaldocs/jnvwzqxzbpw/OPENAI%20NEW%20YORK%20TIMES%20COPYRIGHT%20LAWSUIT%20govtbrief.pdf)
- 의견서는 원고 측 입장이 기본 저작권 원칙에 맞지 않고 과학과 유용한 기술의 진보를 심각하게 저해할 것이라고 주장했다. [법원 제출 문서](https://fingfx.thomsonreuters.com/gfx/legaldocs/jnvwzqxzbpw/OPENAI%20NEW%20YORK%20TIMES%20COPYRIGHT%20LAWSUIT%20govtbrief.pdf), [Reason](https://reason.com/2026/09/04/doj-says-barring-ai-training-on-copyrighted-material-could-severely-hamper-tech-progress/)

기록할 수 있는 문장: “미국 법무부, 뉴욕타임스의 OpenAI 소송에 AI 학습을 공정 이용으로 보는 의견서를 제출.”

기존 장면: `2025-06-fair-use` (4개). 추가할 수 없다. 공정 이용 약식판결 신청이 진행 중이어서, 판결이 나오면 그 사건과 함께 새 장면으로 묶는 편이 낫다.

영어 표기: Statement of Interest of the United States (문서 표제).

주의: 판결이 아니고 법원을 구속하지 않는다. 뉴욕타임스 쪽 반대 입장은 함께 적어야 한다(출판사들은 9월 28일 이 의견서에 비중을 두지 말라고 요청했다고 보도됐다). 2026-10-27 기준 판결은 없었다고 보도됐으며(진행 중), 답변서 기한은 출처마다 다르다.

### 6. Meta의 약관 개정 중단, 11월 5일

- Meta는 11월 5일 개정 약관 미리보기를 내리고, 변경을 중단했으며 11월 20일에 시행하지 않는다고 안내했다. 철회가 아니라 기한 없는 중단이고 기존 약관이 유지된다. [Nieman Lab](https://www.niemanlab.org/2026/11/meta-pulls-down-controversial-terms-of-service/)
- 그전에 노르웨이와 브라질 법원이 언론사 소송에서 가처분을 내렸다고 같은 기사가 전한다. [Nieman Lab](https://www.niemanlab.org/2026/11/meta-pulls-down-controversial-terms-of-service/)

기록할 수 있는 문장: “Meta, 웹 콘텐츠 이용을 넓히려던 상업 이용약관 개정을 기한 없이 중단.”

기존 장면: `2026-10-training-controls` (3개). 3번째 항목이 이미 “도입이 일시 중단된 약관”을 언급하므로, 새로 더해지는 사실은 11월 20일 시행 취소와 해외 가처분이다.

주의: 철회로 쓰지 않는다. Meta의 안내문 원문을 직접 확인하지 못했고 언론 보도 기준이다. 가처분의 날짜와 법원은 확인되지 않았다.

### 7. Challenger 10월 감원 보고서, 11월 5일

- 10월 발표 감원은 43,994명이고, 그중 AI를 이유로 든 감원은 1,265명으로 2026년 월간 최저다. [Challenger 보고서](https://www.challengergray.com/wp-content/uploads/2026/11/Challenger-Report-October-2026.pdf)
- 10월까지 누적 사유 1위는 시장·경제 여건(130,531명)으로 AI(121,401명, 전체의 약 20%)를 앞질렀다. 보고서는 사유가 기술에서 경제로 옮겨 갔다고 설명한다. [Challenger 보고서](https://www.challengergray.com/wp-content/uploads/2026/11/Challenger-Report-October-2026.pdf)

기록할 수 있는 문장: “Challenger 보고서에서 2026년 누적 감원 사유 1위가 AI에서 시장·경제 여건으로 바뀌었다.”

기존 장면: `2026-02-block-layoffs` (4개). 추가할 수 없다.

주의: 기업이 발표한 감원 계획을 세는 자료이며 실제 실직자 수가 아니다. 기업이 내세운 사유이고 AI 분류 자체가 모호하다는 지적이 있다. AI가 일자리에 미치는 영향이 줄었다는 뜻으로 쓰지 않는다.

## 검토 후 제외

- D.C. 항소법원의 Anthropic 공급망 위험 지정 유지(9월 25일): `2026-02-pentagon`의 4번째 항목에 이미 있다.
- GPT-6 Cyber(11월 5일): OpenAI가 사이버 위험을 Critical로 평가했지만, `2026-09-math-gpt-6`이 GPT-6 Astra를 이미 최고 등급 최초 사례로 기록했다. `2026-10-cyber-defense`도 4개다.
- OpenAI의 1.25조 달러 평가 투자 유치, Anthropic 상장 평가액 논의 하락: 익명 소식통 보도뿐이고 규모와 조건이 보도마다 다르다. 공시나 공식 발표가 나오면 다시 본다.
- Tesla Optimus의 프리몬트 생산 시작(10월 21일): Tesla 원문을 확인하지 못했고 `2026-08-humanoids`도 4개다.
- Cisco Talos의 “AI가 이끈 최초의 악성코드”(9월 22일), Exin의 생쥐 뇌 시술(10월 28일): 각각 단일 출처, 회사 대표의 게시물뿐이다.
- AI기본법·데이터산업법 개정안 국무회의 통과(10월 13일), 국가AI전략위 입법 원칙 확정: 흐름을 바꾼 사건 기준에 못 미친다.
- OpenAI의 지방 공무원 대상 NDA 중단: 뉴스 요약에만 있고 확인되지 않아 후보 1에 넣지 않았다.

## 기간 밖에서 눈에 띈 것

- SpaceX 나스닥 상장(6월 12일): 750억 달러를 조달한 사상 최대 공모다. 기존 `2026-06-ipo`에 없으며 이번 조사 범위가 아니어서 사실만 적어 둔다.
- Anthropic 저자 소송 합의 최종 승인(7월 20일), EU 디지털 옴니버스 공포(7월 24일): 기존 장면 항목에 없을 수 있다. 2차 출처로만 봤다.
