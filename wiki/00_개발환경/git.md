# 00. git 설치 과정 — 설치부터 GitHub에 올리기까지

> 과정: 개발환경 (React과정 00회차) · [노션 원문](https://app.notion.com/p/00-git-40d848f71c9b8079ace0efe6d721e18d) · 최종 갱신일: 2026-11-09

## 한눈에 보기
- Windows용 Git(Git for Windows 2.56) 설치 화면 11개에서 무엇을 고르는지 표로 정리했다. 그중 **기본 브랜치 이름을 `main`으로 바꾸는 설정**은 GitHub에 올릴 때의 `main` 브랜치와 이어진다.
- 설치 후 처음 한 번 `git config --global`로 내 이름·이메일을 등록한다.
- 내 폴더를 GitHub에 올리는 순서: `init → status → add → status → commit → remote add → branch -M main → push`.
- 강의 비유: `add`는 변경 내역을 **장바구니**에 담는 것, `status`는 장바구니 내용을 확인하는 것.

## 도구별 역할

> 💡 보충: 강의 원문에는 역할 설명이 없어 덧붙인다.
> - **Git**: 내 컴퓨터에서 파일의 변경 이력을 기록·관리하는 프로그램
> - **GitHub**: Git 저장소를 인터넷에 올려 보관·공유하는 서비스 (원격 저장소)
> - **Git Bash**: Git for Windows에 함께 설치되는 터미널

## 설치·확인 절차

### 1. Git 설치 (Windows)
원문 스크린샷은 **Select Components** 화면부터 시작한다. 각 화면에서 아래처럼 고르고 **Next**, 마지막 화면에서 **Install**.

| # | 설치 화면 | 선택 | 뜻 |
|---|---|---|---|
| 1 | Select Components | 체크: Windows Explorer integration(Open Git Bash here / Open Git GUI here), Git LFS, `.git*` 설정 파일 연결, `.sh` 파일 연결, **Add a Git Bash Profile to Windows Terminal**, Scalar · 체크 해제: Additional icons, Check daily for updates | 탐색기 우클릭으로 Git Bash 열기, Windows Terminal에 Git Bash 프로필 추가 등 |
| 2 | Choosing the default editor | Use Vim (기본값) | Git이 메시지 입력 등에 쓸 편집기 |
| 3 | Adjusting the name of the initial branch | **Override the default branch name** → `main` 입력 | `git init` 할 때 첫 브랜치 이름을 `master` 대신 `main`으로 |
| 4 | Adjusting your PATH environment | Git from the command line and also from 3rd-party software (Recommended) | Git Bash뿐 아니라 명령 프롬프트·PowerShell·서드파티 프로그램(VS Code 등)에서도 `git` 사용 |
| 5 | Choosing the SSH executable | Use bundled OpenSSH | Git에 포함된 ssh 사용 |
| 6 | Choosing HTTPS transport backend | Use the native Windows Secure Channel library | Windows 인증서 저장소로 HTTPS 인증서 확인 |
| 7 | Configuring the line ending conversions | Checkout Windows-style, commit Unix-style line endings | 줄바꿈 자동 변환 (`core.autocrlf=true`). Windows 권장값 |
| 8 | Configuring the terminal emulator | Use Windows' default console window | Git Bash 창으로 Windows 기본 콘솔(cmd.exe) 사용 |
| 9 | Choose the default behavior of `git pull` | Merge | pull 때 갈라진 기록을 merge 커밋으로 합침 |
| 10 | Choose a credential helper | Git Credential Manager | GitHub 로그인 정보를 저장해 매번 묻지 않게 함 |
| 11 | Configuring extra options | Enable file system caching 체크, Enable symbolic links 체크 안 함 → **Install** | 파일 정보 캐시로 속도 향상 |

> 💡 보충
> - 다운로드: <https://git-scm.com/downloads>. 첫 화면(라이선스, 설치 경로)은 원문에 없으며 기본값으로 진행하면 된다.
> - 2번 편집기: Vim이 낯설면 목록에서 "Use Visual Studio Code as Git's default editor"를 골라도 된다. `git commit -m "..."`처럼 메시지를 바로 쓰면 편집기가 열릴 일은 거의 없다.
> - **Mac**: 터미널에서 `git --version`을 입력하면 설치되어 있으면 버전이 나오고, 없으면 개발자 도구(Command Line Tools) 설치 창이 뜬다. Homebrew를 쓰면 `brew install git`.
> - 설치 확인: 새 터미널에서 `git --version`.

### 2. 처음 한 번: 사용자 정보 등록
커밋에 "누가 했는지"로 기록될 이름과 이메일이다. GitHub 계정의 유저네임·이메일로 적는다.

```bash
git config --global user.name "내GitHub이름"
git config --global user.email "내이메일@example.com"
```

> 💡 보충: `--global`은 이 컴퓨터의 모든 저장소에 적용한다는 뜻이라 한 번만 하면 된다. 잘 들어갔는지는 `git config --global --list`로 확인한다.

### 3. GitHub에 올리는 순서
GitHub에서 빈 저장소를 만들어 두고, 올릴 프로젝트 폴더에서 터미널을 열어 차례로 실행한다.

```bash
git init
git status
git add .
git status
git commit -m "첫 번째 업로드입니다."
git remote add origin https://github.com/<내아이디>/<저장소>.git
git branch -M main
git push -u origin main
```

| # | 명령 | 강의 설명 |
|---|---|---|
| 1 | `git init` | 장바구니 생성 |
| 2 | `git status` | (4번과 같은 명령) |
| 3 | `git add .` | 장바구니에 생성·수정·삭제된 내역을 모두 포함시키겠다 |
| 4 | `git status` | 장바구니에 어떤 데이터들이 포함되어 있는지 확인 |
| 5 | `git commit -m "첫 번째 업로드입니다."` | — (아래 보충) |
| 6 | `git remote add origin <저장소 주소>` | — (아래 보충) |
| 7 | `git branch -M main` | — (아래 보충) |
| 8 | `git push -u origin main` | — (아래 보충) |

> 💡 보충: 강의에서 설명이 없던 명령의 뜻
> - `git init`: 이 폴더를 Git 저장소로 만든다(숨김 폴더 `.git` 생성). 폴더마다 처음 한 번만.
> - `git add .`의 `.`은 "현재 폴더 전체". 장바구니의 정식 이름은 **스테이징 영역(staging area)**.
> - `git commit -m "메시지"`: 장바구니에 담긴 변경을 하나의 기록(커밋)으로 저장한다. 아직 내 컴퓨터에만 있다.
> - `git remote add origin <주소>`: GitHub 저장소 주소를 `origin`이라는 이름으로 등록한다. 저장소마다 처음 한 번만.
> - `git branch -M main`: 현재 브랜치 이름을 `main`으로 바꾼다. 설치 때 기본 브랜치를 `main`으로 했다면 이미 main이라 변화는 없지만, GitHub 안내대로 넣어 두는 줄이다.
> - `git push -u origin main`: 내 `main`의 커밋을 `origin`(GitHub)으로 올린다. `-u`는 이 연결을 기억해서 다음부터는 `git push`만 쳐도 되게 한다.

### 4. 두 번째부터 올릴 때
`init`, `remote add`, `branch -M`은 처음 한 번만 한다.

> 💡 보충: 이후 수정한 내용을 올릴 때는 이 세 줄이면 된다.
> ```bash
> git add .
> git commit -m "무엇을 바꿨는지"
> git push
> ```

## 자주 쓰는 명령

| 하고 싶은 것 | 명령 |
|---|---|
| 내 이름·이메일 등록 (처음 한 번) | `git config --global user.name "…"` / `user.email "…"` |
| 폴더를 Git 저장소로 만들기 | `git init` |
| 지금 상태 보기 | `git status` |
| 변경 내역 전부 장바구니에 담기 | `git add .` |
| 기록 남기기 | `git commit -m "메시지"` |
| GitHub 저장소 연결 | `git remote add origin <주소>` |
| 브랜치 이름을 main으로 | `git branch -M main` |
| 처음 올리기 | `git push -u origin main` |
| 그다음부터 올리기 | `git push` |

## 문제 생겼을 때

> 💡 보충: 강의 원문에는 없는, 처음 올릴 때 자주 만나는 상황
> - **push 할 때 로그인 창이 뜸**: 정상이다. Git Credential Manager가 브라우저로 GitHub 로그인을 받는다. 한 번 로그인하면 저장된다.
> - **`remote origin already exists`**: 이미 origin을 등록했다. `git remote -v`로 주소를 확인하고, 틀렸으면 `git remote set-url origin <새 주소>`.
> - **`src refspec main does not match any`**: 아직 커밋이 없다. `git add .` → `git commit`을 먼저 한다.
> - **`git`을 찾을 수 없음**: 설치 전에 열어 둔 터미널이다. 터미널(또는 VS Code)을 새로 연다.

## 완료 체크
원문에 완료 체크가 없어 강의 단계로 만든 목록이다.
- [ ] Git을 설치했다 (기본 브랜치 이름 `main`).
- [ ] `git config --global`로 이름·이메일을 등록했다.
- [ ] 프로젝트 폴더를 `init → add → commit` 했다.
- [ ] GitHub 저장소를 `remote add`로 연결하고 `push` 했다.
- [ ] GitHub 웹에서 올라간 파일을 확인했다.

## 질문 노트

_아직 없음_
