---
name: edition-release
description: 판(edition)을 찍고 A2 포스터를 GitHub Releases에 올린 뒤 머지하는 절차. content/editions.yaml에 새 판을 적을 때, edition-N 태그를 달 때, poster 워크플로를 확인하거나 다시 돌릴 때, 포스터를 미리 볼 때 쓴다. Use when cutting a new edition, tagging edition-N, releasing or previewing the poster.
---

# 판 기록과 포스터


의미 있는 시점마다 "판"을 찍습니다. 판마다 벽 전체를 A2 포스터(ko/en, PDF·PNG)로 찍어 GitHub Releases에 올립니다.

사이트의 "가져가기" 구역과 피드는 `poster: true`인 마지막 판의 Release를 가리킵니다. `main`에 머지하면 바로 배포되므로, **Release를 먼저 만들고 머지합니다.** 그래야 링크가 한순간도 비지 않습니다.

1. 콘텐츠 PR에서 `content/editions.yaml`에 다음 판을 적습니다: `{ n, date, poster: true, ko, en }`. `ko`/`en`은 그 판을 찍은 이유 한 줄입니다. 번호는 빠짐없이 이어지고, 날짜는 앞 판보다 늦고 `asOf` 이하여야 합니다(빌드가 검사합니다). `asOf`를 판 날짜에 맞춥니다.
2. PR 브랜치를 `main` 최신에 맞춘 뒤(rebase), PR의 마지막 커밋에 태그를 답니다: `git tag edition-N && git push origin edition-N`. squash 머지 결과는 이 커밋과 내용이 같으므로 태그가 그 판의 내용을 정확히 가리킵니다.
3. Actions의 `poster` 워크플로가 포스터를 찍어 `edition-N` Release에 올렸는지 확인합니다. 실패하면 고친 뒤 Actions에서 판 번호를 넣어 다시 돌립니다(`workflow_dispatch`).
4. Release를 확인한 뒤 PR을 머지합니다. 태그를 단 뒤 PR을 고쳤으면 태그를 지우고(`git push --delete origin edition-N`) 2번부터 다시 합니다.
- 포스터 미리보기: `npm run build && npx astro preview --port 4321 --ignore-lock &` 뒤 `npm run poster -- --edition N --locale ko --out out`.


## 여러 PR을 한 판으로 묶을 때

- 판은 PR마다가 아니라 묶음 작업이 끝날 때 한 번 찍습니다. 판 날짜는 앞 판보다 늦어야 합니다.
- PR을 겹쳐 쌓았으면 맨 위 PR을 바로 아래 PR로 squash 머지해 하나로 모은 뒤, 남은 PR에 `edition-N` 태그를 달고 Release를 확인한 다음 `main`에 머지합니다. 포스터가 내용보다 늦는 순간이 없게 하려는 것입니다.
