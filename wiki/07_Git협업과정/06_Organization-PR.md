# 06. Organization과 PR — Fork와 Pull Request로 팀 프로젝트 세팅하기

> 과정: Git협업과정 · [노션 원문](https://app.notion.com/p/41ce6d97109c8035902bf171779bb1cd) · 최종 갱신일: 2026-11-20

## 한눈에 보기
- **Fork**: 내 것이 아닌 저장소를 내 계정 저장소로 복사한다. 복사본은 내 소유라 마음대로 고칠 수 있고, 원본이 어디인지 연결 정보가 남는다.
- **Organization**: 여러 사람이 공유하는 저장소 그룹. 팀 구성·권한 관리, 팀 공용 저장소를 만든다.
- **Pull Request(PR)**: 내 변경 사항을 합쳐 달라고 요청하는 기능. PR에서 변경 사항을 토론하고 피드백한다.
- 흐름: 내 컴퓨터에서 `commit` → **내 Fork 저장소(origin)에 `push`** → **공용(Organization) 저장소로 PR** → 팀장이 확인하고 **Merge**.
- 작업 순서(GitHub Flow): `main`에서 직접 작업하지 않는다. 공용 저장소에서 pull로 최신화 → **작업용 브랜치**에서 작업·커밋 → 다시 최신 `main`을 작업 브랜치에 merge → `git push origin 작업브랜치` → PR.

## 학습 목표
강의 페이지에 학습 목표가 따로 없어 본문 제목으로 정리했다.
- Fork, Organization, Pull Request를 설명한다.
- 팀장으로서 Organization·공용 저장소를 세팅하고 첫 PR을 병합한다.
- 팀원으로서 Fork·clone하고 원격 저장소 두 개(내 Fork, 공용 저장소)를 연결한다.
- 작업 브랜치에서 작업하고 PR을 보내는 순서를 따른다.

## 핵심 개념

### 1. 전체 그림
강의 그림 (글로 옮김)

```text
[Local]   Working Directory ──add──▶ Staging Area ──commit──▶ Local Repository
                                                                  │ git push
[GitHub]  Organization Repository ◀──Pull Request(PR)── Remote Repository
             (팀 공용 저장소)                              (내 계정의 Fork)
```

### 2. GitHub의 주요 기능

| 기능 | 뜻 | 특징 |
|---|---|---|
| **Fork** | 내 소유가 아닌 저장소를 **내 계정의 Repository로 복사**해 오는 것 | 복사본은 내 소유라 마음대로 수정 가능. 원본이 어느 저장소인지 연결 정보가 유지된다 |
| **Organization** (조직) | 여러 사람이 공유하는 저장소 그룹 | 팀·회사 단위 프로젝트 관리에 맞다. 팀 구성·권한 관리, 조직이 공유하는 Organization Repository 생성 |
| **Pull Request** (PR) | 코드 변경 사항을 **병합해 달라고 요청**하는 기능 | 변경 사항 토론·피드백 가능 |

> 💡 보충: Fork는 **GitHub 위에서** 저장소를 복사하는 것이고, clone은 GitHub의 저장소를 **내 컴퓨터로** 복사하는 것이다 ([03회차](03_원격저장소.md)). 이 강의의 세팅은 둘 다 한다: 공용 저장소 → (Fork) → 내 GitHub 저장소 → (clone) → 내 컴퓨터.

## 실습 정리 — 팀 프로젝트 세팅 과정

### 1. 팀장이 처음에 하는 일 (세팅)
1. **Organization 생성** — GitHub 메인 → 프로필 → Your Organizations → New Organization → 무료 플랜 → Organization 이름·이메일 설정
2. **팀원 초대** — Organization 페이지 → People → Invite member → 팀원 이메일·아이디 검색 → 권한 설정(보통 Member)
3. **Repository 생성** — Organization 페이지 → New repository → 이름(예: `team-project`) → Public/Private 선택 → `README.md` 생성 체크
4. **기본 파일 설정 (프로젝트 세팅)**
   - 공용 저장소의 **Fork** 버튼을 눌러 내 개인 저장소로 복제한다.
   - 로컬에 프로젝트 폴더를 만들고 clone한다: `git clone [url] .`
   - 리모트 연결 확인: `git remote -v` — **origin에 내 계정의 Fork 저장소**가 등록되어 있어야 한다 (잘못되어 있으면 수정).
   - 공용 저장소도 리모트로 연결한다: `git remote add [별칭] [공용 저장소 주소]` → `git remote -v`로 다시 확인.
   - `.gitignore` 파일 생성 등 프로젝트 기본 구조를 만든다.
   - 스테이징 → 커밋 → push (**Fork한 origin으로** 해야 한다).
5. **공용 저장소로 PR 보내기** — Fork한 저장소 → Pull requests → New pull request → 변경 사항 확인(특히 **충돌이 없는지**) → Create pull request → PR 제목(무엇을 수정했는지)·내용(무엇을 했는지 자세히) → Create pull request
6. **PR 확인과 병합** — 공용 저장소 → Pull requests에 숫자가 뜬다 → PR 하나 선택 → PR 설명과 **Files changed**에서 어떤 파일이 바뀌었는지 대략 파악(특히 충돌 확인) → 이상이 없으면 **Merge pull request**
7. 팀원들에게 세팅이 끝났다고 알린다.

### 2. 팀원이 하는 일
1. **초대 수락** — 이메일의 초대 링크를 누르거나 GitHub 알림에서 수락
2. **Fork 생성** (팀장이 세팅을 다 끝낸 뒤) — Organization 저장소에 가서 Fork 버튼 → 내 저장소로 복제
3. **로컬 환경 설정**
   - 로컬에 프로젝트 폴더를 만들고 clone: `git clone [url] .`
   - `git remote -v` — origin에 내 Fork 저장소가 있어야 한다.
   - 공용 저장소도 연결: `git remote add [별칭] [공용 저장소 주소]` → `git remote -v`로 확인

> 💡 보충: 리모트를 두 개 연결한 뒤 `git remote -v`는 이렇게 보인다 (공용 저장소 별칭을 `upstream`으로 지은 경우. 강의는 별칭을 정하지 않았고, `upstream`이 흔히 쓰는 이름이다).
> ```text
> origin    https://github.com/<내아이디>/team-project.git (fetch)
> origin    https://github.com/<내아이디>/team-project.git (push)
> upstream  https://github.com/<조직이름>/team-project.git (fetch)
> upstream  https://github.com/<조직이름>/team-project.git (push)
> ```
> - **origin = 내 Fork** (push하는 곳), **upstream = 공용 저장소** (pull로 최신을 받는 곳).
> - clone할 때 공용 저장소 주소를 넣었으면 origin이 공용 저장소가 된다. 이때는 `git remote set-url origin <내 Fork 주소>`로 바꾸거나, `git remote rename`으로 별칭을 정리한다.

### 3. 작업할 때 순서 (팀장·팀원 공통)
- 이 순서는 어떤 Git 전략을 쓰느냐에 따라 달라진다. 강의는 가장 쉽고 직관적인 **GitHub Flow**를 쓴다.

1. **작업 시작 전 준비**
   - `main` 브랜치로 이동한다 (**`main`에서 작업하지 않는다!**).
   - **공용 저장소**에서 pull을 받아 최신으로 만든다.
   - 최신 `main`에서 **작업용 브랜치**를 만든다.
2. **작업 진행**
   - 작업용 브랜치에서만 작업한다.
   - 끝나면 커밋한다. 여러 번 커밋해도 된다.
3. **원격 저장소에 push 준비**
   - `main`으로 이동해서 **공용 저장소**에서 pull (최신화)
   - 작업 브랜치로 돌아와서(checkout) **`main`을 병합(merge)**한다. 충돌이 나면 해결 후 커밋, 충돌이 없으면 자동 커밋.
   - **내 원격 저장소(Fork)**에 push: `git push origin [작업 브랜치명]` — 원격에 같은 이름의 브랜치를 만들면서 올라간다.
4. **PR 생성**
   - PR을 **공용 저장소의 `main`**으로 보낸다.
   - PR을 보낸 뒤 팀장에게 연락한다.

> 💡 보충: 위 순서를 명령으로 옮기면 이렇다. 공용 저장소 별칭은 `upstream`, 작업 브랜치는 `feature/login`이라고 했다 (로컬 폴더 저장소로 같은 구조를 만들어 Git 2.50에서 확인).
> ```bash
> # 1. 작업 시작 전 준비
> git checkout main
> git pull upstream main
> git checkout -b feature/login
>
> # 2. 작업 진행
> git add .
> git commit -m "로그인 화면 추가"
>
> # 3. push 준비
> git checkout main
> git pull upstream main
> git checkout feature/login
> git merge main                 # 다른 사람 작업이 들어왔으면 병합 커밋 (vim이 열리면 :wq)
> git push origin feature/login  # → * [new branch]  feature/login -> feature/login
> ```
> 4번 PR은 GitHub 웹에서 만든다. push 직후 내 Fork 저장소에 **Compare & pull request** 버튼이 뜬다. PR 화면 위쪽이 `base repository: <조직>/team-project, base: main ← head repository: <내아이디>/team-project, compare: feature/login`인지 확인한다.

### 4. PR 받을 때 팀장이 하는 일
- 공용 저장소 → Pull requests에 숫자가 뜬다 → PR 하나 선택
- PR 설명과 **Files changed**에서 어떤 파일이 바뀌었는지 대략 파악한다 (특히 충돌 확인).
- 이상이 없으면 **Merge pull request**, 이상이 있으면 해당 팀원에게 다시 보내 달라고 한다.

## 헷갈리기 쉬운 점
- **push는 내 Fork(origin)로, 최신 받기(pull)는 공용 저장소에서.** 공용 저장소에 바로 push하지 않는다. 공용 저장소에는 PR로만 들어간다.
- **`main`에서 작업하지 않는다.** `main`은 공용 저장소의 최신 상태를 받아 오는 용도로만 쓰고, 작업은 항상 작업 브랜치에서 한다.
- push 전에 **최신 `main`을 작업 브랜치에 merge**하는 이유: 다른 사람의 PR이 먼저 합쳐졌을 수 있다. 충돌을 내 컴퓨터에서 먼저 해결해 두면 PR에서 충돌이 나지 않는다 ([05회차](05_원격충돌-fetch.md)).
- PR은 **요청**이다. PR을 보냈다고 공용 저장소에 바로 합쳐지지 않는다. 팀장이 Merge해야 들어간다.
- Fork한 내 저장소는 공용 저장소가 바뀌어도 **자동으로 따라 바뀌지 않는다.** 그래서 매번 공용 저장소에서 pull로 받는다.

> 💡 보충: PR이 Merge된 뒤에는 `git checkout main` → `git pull upstream main`으로 받고, 다 쓴 작업 브랜치는 `git branch -d feature/login`으로 지운 다음 새 작업은 새 브랜치로 시작한다.

## 빠른 참고 (치트시트)

| 하고 싶은 것 | 쓰는 것 | 예시 |
|---|---|---|
| 내 Fork를 현재 폴더에 복제 | `git clone [내 Fork url] .` | 빈 폴더에서 |
| 연결 확인 | `git remote -v` | origin = 내 Fork |
| 공용 저장소 연결 | `git remote add 별칭 주소` | `git remote add upstream <공용 저장소 주소>` |
| 최신 받기 | (`main`에서) `git pull 공용별칭 main` | `git pull upstream main` |
| 작업 브랜치 만들기 | `git checkout -b 이름` | `git checkout -b feature/login` |
| 작업 브랜치를 최신으로 | (작업 브랜치에서) `git merge main` | |
| 내 Fork에 올리기 | `git push origin 작업브랜치` | `git push origin feature/login` |
| 합쳐 달라고 요청 | GitHub에서 Pull Request | base: 공용 `main` ← compare: 내 작업 브랜치 |

## 확인 문제

<details><summary>Q. Fork와 clone의 차이는?</summary>

Fork는 남의 GitHub 저장소를 **내 GitHub 계정**으로 복사하는 것, clone은 GitHub 저장소를 **내 컴퓨터**로 복사하는 것이다.
</details>

<details><summary>Q. 팀원 세팅이 끝난 뒤 `git remote -v`에 무엇이 보여야 하나?</summary>

origin = 내 계정의 Fork 저장소, 그리고 따로 등록한 별칭(예: upstream) = 공용(Organization) 저장소. 두 개가 연결되어 있어야 한다.
</details>

<details><summary>Q. 작업을 마치고 PR을 보내기 전까지의 순서는?</summary>

`main`으로 이동 → 공용 저장소에서 pull → 작업 브랜치로 이동 → `git merge main`(충돌 나면 해결·커밋) → `git push origin 작업브랜치` → 공용 저장소 `main`으로 PR.
</details>

<details><summary>Q. 왜 `main`에서 바로 작업하지 않나?</summary>

`main`은 공용 저장소의 최신 상태를 받아 오는 기준이다. 여기서 작업하면 받아 온 최신 내용과 내 작업이 섞여 충돌이 나기 쉽고, PR 단위로 나눠 보내기도 어렵다. 작업은 작업 브랜치에서 한다.
</details>

<details><summary>Q. PR을 받은 팀장은 무엇을 확인하나?</summary>

PR 설명과 Files changed에서 어떤 파일이 바뀌었는지, 충돌이 없는지 본다. 이상이 없으면 Merge pull request, 있으면 팀원에게 다시 보내 달라고 한다.
</details>

## 완료 체크
원문에 완료 체크가 없어 강의 단계로 만든 목록이다.
- [ ] (팀장) Organization을 만들고 팀원을 초대하고 공용 저장소를 만들었다.
- [ ] 공용 저장소를 Fork하고, 내 Fork를 clone했다.
- [ ] `git remote -v`로 origin(내 Fork)과 공용 저장소 별칭이 둘 다 보이는지 확인했다.
- [ ] `main`을 최신으로 받고 작업 브랜치를 만들어 커밋했다.
- [ ] 최신 `main`을 작업 브랜치에 merge하고 `git push origin 작업브랜치`로 올렸다.
- [ ] 공용 저장소 `main`으로 PR을 보내고, Merge까지 확인했다.

## 질문 노트

_아직 없음_
