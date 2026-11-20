# 05. 원격 저장소와 충돌(fetch) — push가 거부될 때와 충돌 해결

> 과정: Git협업과정 · [노션 원문](https://app.notion.com/p/41ce6d97109c804b9bd6cc7cbc4b5346) · 최종 갱신일: 2026-11-20

## 한눈에 보기
- **원격 저장소도 로컬처럼 브랜치를 가진다.** 로컬 `main`과 원격 `main`은 서로 독립이라, 따로따로 새 커밋이 생길 수 있다.
- **pull** = 원격의 변경을 가져온 뒤 내 브랜치에 merge. **push** = 내 커밋을 원격에 올려 합치기인데, **Fast-Forward로 합칠 수 있을 때만** 된다.
- 원격에 내가 없는 커밋이 있으면 push가 `! [rejected] main -> main (fetch first)`로 **거부된다** → 먼저 pull.
- pull할 때 원격과 로컬이 **같은 부분을 다르게** 고쳤으면 **충돌(CONFLICT)**이 난다. 파일의 `<<<<<<<` `=======` `>>>>>>>` 표시를 보고 원하는 내용으로 고친 뒤 `add` → `commit` → `push`.

## 학습 목표
강의 페이지에 학습 목표가 따로 없어 본문 제목으로 정리했다.
- 원격 브랜치와 로컬 브랜치의 관계를 설명한다.
- push가 거부되는 경우와 pull에서 충돌이 나는 경우를 구분한다.
- 충돌 표시를 읽고 해결해서 다시 push한다.

## 핵심 개념

### 1. 원격 저장소의 구조
- 원격 저장소도 로컬처럼 브랜치를 가진다.
- 로컬의 브랜치와 원격의 브랜치는 **독립적**이다.

### 2. 동기화 과정

| 명령 | 하는 일 |
|---|---|
| pull | 변경 사항을 **로컬로 가져온 뒤 merge** |
| push | 로컬의 변경 사항을 원격에 **업로드한 뒤 merge** — **Fast-Forward만 가능** |

> 💡 보충: **Fast-Forward**는 [04회차](04_브랜치.md)의 `hotfix` 병합처럼, 받는 쪽에 새 커밋이 없어서 **앞으로 옮기기만** 하면 되는 병합이다. push는 원격에서 병합 커밋을 만들어 주지 않는다. 그래서 원격에 내가 모르는 커밋이 있으면(두 줄기가 갈라졌으면) push가 거부된다.

### 3. 충돌이 생기는 경우

| 언제 | 왜 |
|---|---|
| **pull** | 원격과 로컬이 **같은 부분을 다르게** 수정했다 |
| **push** | 원격에 **새로운 커밋**이 있다 → 먼저 pull이 필요하다 |

### 4. fetch와 pull

> 💡 보충: 강의 제목의 "fetch"는 push 거부 메시지 `(fetch first)`에 나오는 말이다. 강의 본문에 `git fetch` 명령 설명은 없어서 짧게 덧붙인다.
> - `git fetch origin` — 원격의 새 커밋을 받아 **`origin/main`이라는 원격 추적 브랜치에만** 넣는다. 내 `main`과 파일은 그대로다.
> - `git pull origin main` — **fetch + merge**. 받아 온 뒤 바로 내 브랜치에 합친다.
> - 그래서 `(fetch first)`는 "원격 커밋부터 받아 와라"는 뜻이다. 실제로는 보통 `git pull`로 한 번에 처리한다. 받아 온 것을 먼저 보고 합치고 싶으면 `git fetch origin` → `git log --oneline --graph --all`로 확인 → `git merge origin/main`.

## 실습 정리

### 기초 예제 — 일부러 충돌 만들고 해결하기 (강의)

```bash
# 1. 초기 설정
mkdir git-remote-test
cd git-remote-test
git init
echo "# Remote Test" > README.md
git add README.md
git commit -m "첫 번째 커밋"

# GitHub에서 새 저장소 생성 (README 없이)
git remote add origin [GitHub URL]
git push origin main

# 2. 로컬에서 파일 수정
echo "로컬에서 수정" > file.txt
git add file.txt
git commit -m "로컬에서 파일 추가"

# 3. GitHub에서 직접 수정
# GitHub 웹에서 file.txt 생성
# 내용: "GitHub에서 수정"
# Commit 메시지: "GitHub에서 파일 추가"

# 4. Push 시도 (충돌 발생되어 push가 불가능함)
git push origin main
#  ! [rejected]        main -> main (fetch first)
# error: failed to push some refs to '<https://github.com/>.....'
# 원격에 로컬에 없는 새로운 커밋이 있어서 push 거부됨

# 4. Pull 시도 (충돌 발생)
# 만약 Pull이 안되면 pull 기본 방식이 설정 안되서임....
# `git pull --no-rebase origin main` 로 옵션주고 실행하면 됨
git pull origin main
# CONFLICT (add/add): Merge conflict in file.txt
# Auto-merging file.txt
# Automatic merge failed; fix conflicts and then commit the result.

# 5. 충돌 해결
# file.txt 열어서 확인
# <<<<<<< HEAD
# 로컬에서 수정
# =======
# GitHub에서 수정
# >>>>>>> abc1234...

# 6. 원하는 내용으로 수정
echo "충돌 해결: 두 내용 합치기" > file.txt
git add file.txt
git commit -m "충돌 해결"

# 7. Push
git push origin main
```

단계별로 일어나는 일
1. 로컬에 커밋 1개를 만들어 GitHub에 올린다 → 원격과 로컬이 같다.
2. 로컬에서 `file.txt`를 만들어 커밋한다 (원격은 모른다).
3. GitHub 웹에서 **같은 이름의** `file.txt`를 다른 내용으로 만들어 커밋한다 (로컬은 모른다) → 두 줄기가 갈라졌다.
4. push → 원격에 내가 없는 커밋이 있어서 **거부**. pull → 같은 파일을 서로 다르게 만들어서 **충돌**.
5. 충돌 난 파일에 Git이 양쪽 내용을 표시해 둔다.
6. 파일을 원하는 내용으로 고치고 `add` → `commit`하면 충돌 해결 커밋(병합 커밋)이 생긴다.
7. 이제 원격의 커밋을 포함하므로 push가 된다.

### 충돌 표시 읽기

```text
<<<<<<< HEAD
로컬에서 수정          ← 내 쪽(지금 브랜치, HEAD)의 내용
=======
GitHub에서 수정        ← 받아 온 쪽(원격)의 내용
>>>>>>> abc1234...     ← 받아 온 커밋 번호
```

`<<<<<<<`, `=======`, `>>>>>>>` 줄까지 **모두 지우고** 남길 내용만 남긴다. 강의는 `echo … > file.txt`로 파일 전체를 새 내용으로 바꿔서 해결했다.

> 💡 보충: 실제로 해 본 결과 (Git 2.50, macOS)
> - 4번 push 거부 메시지 아래에 `hint: Updates were rejected because the remote contains work that you do not have locally. … use 'git pull' before pushing again.`이 함께 나온다.
> - **pull 방식을 정하지 않은 컴퓨터**에서 `git pull origin main`을 치면 충돌까지 가지 않고 이렇게 멈춘다.
>   ```text
>   hint: You have divergent branches and need to specify how to reconcile them.
>   ...
>   fatal: Need to specify how to reconcile divergent branches.
>   ```
>   강의 주석의 "pull이 안 되면"이 이 경우다. `git pull --no-rebase origin main`으로 실행하거나, 한 번 `git config --global pull.rebase false`(pull은 merge 방식)를 해 두면 다음부터 그냥 `git pull`이 된다. Windows는 설치 화면 9번에서 Merge를 골랐으면 이 설정이 이미 되어 있다 ([00_개발환경/git](../00_개발환경/git.md)).
> - `--no-rebase`로 pull하면 출력 순서는 `Auto-merging file.txt` → `CONFLICT (add/add): Merge conflict in file.txt` → `Automatic merge failed; …`이다.
> - 충돌 중에 `git status`를 치면 `You have unmerged paths.`와 `both added: file.txt`가 보인다. 해결을 포기하고 pull 전으로 돌아가려면 `git merge --abort`.
> - VS Code로 충돌 파일을 열면 표시 위에 **Accept Current / Accept Incoming / Accept Both** 버튼이 나온다. 고른 뒤 저장하고 `add` → `commit`.

## 헷갈리기 쉬운 점
- **push 거부(`rejected`)와 충돌(`CONFLICT`)은 다르다.** push 거부는 "원격에 새 커밋이 있으니 먼저 받아라"는 뜻이고, 충돌은 받아서 합치다가 같은 부분이 부딪힌 것이다. 다른 파일이나 다른 줄을 고쳤으면 pull만으로 자동으로 합쳐진다.
- 충돌을 해결하고 **`add`와 `commit`까지 해야** 끝난다. 파일만 고치고 push하면 아직 병합 중이라 올라가지 않는다.
- 충돌 표시 줄(`<<<<<<<` 등)을 지우지 않고 커밋하면 그 글자가 코드에 그대로 남는다.
- 충돌을 줄이는 기본은 [03회차](03_원격저장소.md)의 **pull 먼저, push는 나중에**다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| push가 `rejected (fetch first)` | 먼저 pull | `git pull origin main` |
| pull이 `Need to specify how to reconcile` | merge 방식으로 pull | `git pull --no-rebase origin main` |
| pull 방식을 merge로 고정 | `git config --global pull.rebase false` | |
| 충돌 파일 찾기 | `git status` | `both added:` / `both modified:` |
| 충돌 해결 마무리 | 파일 수정 → `git add` → `git commit` | `git commit -m "충돌 해결"` |
| 병합 취소 | `git merge --abort` | |
| 원격 커밋만 받아 보기 | `git fetch origin` | 합치기는 `git merge origin/main` |

## 확인 문제

<details><summary>Q. 원격에 내 로컬에 없는 커밋이 있을 때 push하면?</summary>

`! [rejected] main -> main (fetch first)`로 거부된다. push는 Fast-Forward로만 합칠 수 있기 때문이다. 먼저 pull해서 원격 커밋을 받아 합친 뒤 push한다.
</details>

<details><summary>Q. pull에서 충돌이 나는 경우는?</summary>

원격과 로컬이 **같은 파일의 같은 부분을 서로 다르게** 고쳤을 때. 다른 부분을 고쳤으면 자동으로 합쳐진다.
</details>

<details><summary>Q. 충돌 표시에서 `=======` 위와 아래는 각각 무엇인가?</summary>

위(`<<<<<<< HEAD`부터)는 내 쪽(지금 브랜치)의 내용, 아래(`>>>>>>> 커밋번호`까지)는 받아 온 쪽의 내용이다.
</details>

<details><summary>Q. 충돌을 해결하는 순서는?</summary>

충돌 파일을 열어 원하는 내용만 남기고 표시 줄을 지운다 → `git add 파일` → `git commit` → `git push`.
</details>

<details><summary>Q. `git fetch`와 `git pull`의 차이는?</summary>

fetch는 원격 커밋을 `origin/main`에 받아 오기만 하고 내 브랜치는 그대로 둔다. pull은 fetch한 뒤 내 브랜치에 merge까지 한다.
</details>

## 완료 체크
원문에 완료 체크가 없어 강의 단계로 만든 목록이다.
- [ ] `git-remote-test` 저장소를 만들어 GitHub에 push했다.
- [ ] 로컬과 GitHub 웹에서 같은 이름의 파일을 서로 다르게 커밋했다.
- [ ] push가 `rejected (fetch first)`로 거부되는 것을 봤다.
- [ ] pull로 충돌을 만들고, 충돌 표시를 읽었다.
- [ ] 파일을 고쳐 `add` → `commit` → `push`로 해결했다.

## 질문 노트

_아직 없음_
