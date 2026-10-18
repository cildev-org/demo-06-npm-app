# demo-06-npm-app

Demo target for Blue-Oryx dependency pull requests in npm (fix class A1).

> **This app is vulnerable on purpose.** `main` locks `adm-zip` `0.4.7`,
> which is affected by CVE-2018-1002204 (a zip entry `../evil-x` is written
> outside the destination folder `/data/uploads`). Do not run it anywhere
> that is reachable from a network you care about.

## What is here

| File | Purpose |
| --- | --- |
| `package.json` | One direct dependency, `adm-zip` `^0.4.7` |
| `package-lock.json` | The pin: `adm-zip` `0.4.7` from registry.npmjs.org |
| `server.js` | Node app: `POST /extract` unpacks a zip into `/data/uploads` with adm-zip's `extractAllTo`; `GET /file?name=` reads a file under `/data` |
| `Dockerfile` | One Node stage (pinned by digest) that runs `npm install --ignore-scripts` from the lockfile |
| `.github/workflows/build.yml` | Builds the image on every pull request; on a push to `main` it also pushes it to `ghcr.io/<repo>:<commit>` |

## Demo flow

1. Blue-Oryx receives a confirmed finding for CVE-2018-1002204 on the asset
   bound to this repository.
2. It opens a pull request from a `blue-oryx/<id>` branch that changes the
   locked `adm-zip` in `package-lock.json` to the lowest fixed version
   (`0.4.11`), inside the range of `package.json`.
3. The `build` workflow runs on the pull request.
4. A person reviews and merges the pull request. Blue-Oryx never merges.
5. The workflow pushes the image of the merge commit. The operator deploys it
   to the lab target; Blue-Oryx never deploys.
6. The operator confirms the deploy and Blue-Oryx runs the same exploit again.
   Only a blocked re-run makes the task `verified-fixed`.

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | What Blue-Oryx patches |
| `vulnerable-baseline` | The vulnerable state, for resetting `main` between demo runs |
