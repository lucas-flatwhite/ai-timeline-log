---
name: edition-release
description: 판(edition)을 찍고 A2 포스터를 GitHub Releases에 올린 뒤 머지하는 절차. content/editions.yaml에 새 판을 적을 때, edition-N 태그를 달 때, poster 워크플로를 확인하거나 다시 돌릴 때, 포스터를 미리 볼 때 쓴다. Use when cutting a new edition, tagging edition-N, releasing or previewing the poster.
---

# 판 기록과 포스터


의미 있는 시점마다 "판"을 찍습니다. 판마다 벽 전체를 A2 포스터(ko/en, PDF·PNG)로 찍어 GitHub Releases에 올립니다.

사이트의 "포스터와 데이터" 칸과 피드는 `poster: true`인 마지막 판의 Release를 가리킵니다. 포스터와 데이터 칸의 포스터 자리는 그 판의 미리보기(교정지 모양)와 받기 버튼의 용량을 보여 주는데, 둘 다 Release가 생긴 뒤에야 알 수 있습니다. `main`에 머지하면 바로 배포되므로, **Release를 먼저 만들고, 미리보기와 용량을 가져온 뒤 머지합니다.** 그래야 링크와 미리보기가 한순간도 비지 않습니다.

1. 콘텐츠 PR에서 `content/editions.yaml`에 다음 판을 적습니다: `{ n, date, poster: true, ko, en }`. `ko`/`en`은 그 판을 찍은 이유 한 줄입니다. 번호는 빠짐없이 이어지고, 날짜는 앞 판보다 늦고 `asOf` 이하여야 합니다(빌드가 검사합니다). `asOf`를 판 날짜에 맞춥니다.
2. PR 브랜치를 `main` 최신에 맞춘 뒤(rebase), PR의 마지막 커밋에 태그를 답니다: `git tag edition-N && git push origin edition-N`. squash 머지 결과는 4번의 미리보기 커밋을 빼면 이 커밋과 벽 내용이 같으므로, 태그가 그 판의 내용을 정확히 가리킵니다.
3. Actions의 `poster` 워크플로가 포스터를 찍어 `edition-N` Release에 올렸는지 확인합니다. 실패하면 고친 뒤 Actions에서 판 번호를 넣어 다시 돌립니다(`workflow_dispatch`).
4. `npm run poster:pull -- --edition N`을 돌립니다. 이 스크립트가 하는 일은 셋입니다.
   - Release의 파일 크기와 PNG 픽셀 크기를 `content/editions.yaml`의 그 판 `files`에 적습니다.
   - 화면용 PNG를 가로 600px AVIF로 줄여 `public/poster/edition-N-<언어>.avif`에 둡니다.
   - 지난 판의 미리보기를 지웁니다.

   이 두 파일만 바꾼 커밋을 PR에 더합니다. 벽 내용은 바뀌지 않으므로 태그는 그대로 둡니다. 이 단계 전에는 빌드가 `has no files yet` 경고를 내고, 포스터 칸이 미리보기와 용량 없이 나옵니다.
5. PR을 머지합니다. 태그를 단 뒤 벽 내용(장면, 연도, 표지)을 고쳤으면 태그를 지우고(`git push --delete origin edition-N`) 2번부터 다시 합니다.
- 포스터 미리보기: `npm run build && npx astro preview --port 4321 --ignore-lock &` 뒤 `npm run poster -- --edition N --locale ko --out out`.


## 여러 PR을 한 판으로 묶을 때

- 판은 PR마다가 아니라 묶음 작업이 끝날 때 한 번 찍습니다. 판 날짜는 앞 판보다 늦어야 합니다.
- 판 없이 장면을 더하면 벽과 마지막 포스터가 달라집니다. 포스터 칸은 그 판의 파일을 그대로 보여 주므로, 묶음이 끝나면 판을 찍습니다.
- PR을 겹쳐 쌓았으면 맨 위 PR을 바로 아래 PR로 squash 머지해 하나로 모은 뒤, 남은 PR에 `edition-N` 태그를 달고 Release를 확인한 다음 `main`에 머지합니다. 포스터가 내용보다 늦는 순간이 없게 하려는 것입니다.
