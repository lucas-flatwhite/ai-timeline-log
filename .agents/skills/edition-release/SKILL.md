---
name: edition-release
description: How to cut an edition, upload the A2 poster to GitHub Releases and then merge. Use when writing a new edition in content/editions.yaml, tagging edition-N, checking or rerunning the poster workflow, or previewing the poster.
metadata:
  internal: true
---

# Editions and posters


Cut an "edition" at each meaningful point. Each edition prints the whole wall as an A2 poster (ko/en, PDF and PNG) and uploads it to GitHub Releases.

The site's "Poster and data" block and the feed point to the Release of the latest edition with `poster: true`. The poster slot in that block shows the edition's preview (in the proof look) and the sizes on the download buttons, and both are known only after the Release exists. Merging to `main` deploys right away, so **create the Release first, fetch the preview and sizes, then merge.** That way the links and the preview are never empty, not even for a moment.

1. In the content PR, add the next edition to `content/editions.yaml`: `{ n, date, poster: true, ko, en }`. `ko`/`en` are one line on why the edition was cut. Numbers run without gaps, and the date must be later than the previous edition and no later than `asOf` (the build checks this). Set `asOf` to the edition date.
2. Bring the PR branch up to the latest `main` (rebase), then tag the last commit of the PR: `git tag edition-N && git push origin edition-N`. Apart from the preview commit in step 4, the squash merge result has the same wall content as this commit, so the tag points exactly to that edition's content.
3. Check that the `poster` workflow in Actions printed the poster and uploaded it to the `edition-N` Release. If it fails, fix it and rerun it from Actions with the edition number (`workflow_dispatch`).
4. Run `npm run poster:pull -- --edition N`. This script does three things.
   - It writes the Release's file sizes and PNG pixel sizes into that edition's `files` in `content/editions.yaml`.
   - It reduces the screen PNG to a 600px wide AVIF at `public/poster/edition-N-<locale>.avif`.
   - It deletes the previous edition's preview.

   Add a commit with only these two kinds of files to the PR. The wall content does not change, so leave the tag as it is. Before this step, the build gives a `has no files yet` warning and the poster block appears without the preview and sizes.
5. Merge the PR. If you changed the wall content (scenes, years, cover) after tagging, delete the tag (`git push --delete origin edition-N`) and start again from step 2.
- Poster preview: `npm run build && npx astro preview --port 4321 --ignore-lock &`, then `npm run poster -- --edition N --locale ko --out out`.


## Grouping several PRs into one edition

- Cut an edition once, when the batch of work ends, not per PR. The edition date must be later than the previous edition.
- Adding scenes without an edition makes the wall differ from the latest poster. The poster block shows that edition's files as they are, so cut an edition when the batch ends.
- If PRs are stacked, squash merge the top PR into the one right below to collect them into one, tag the remaining PR with `edition-N`, check the Release, and then merge to `main`. This keeps the poster from ever lagging behind the content.
