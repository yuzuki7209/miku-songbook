# 🎵 미쿠 노래책

하츠네 미쿠 &amp; 오타마톤 테마의 노래책 웹앱입니다.

- **방문자 페이지**: 노래 검색, 노래 요청, 감상평 남기기
- **관리자 페이지** (`/#/admin`): 비밀번호로 로그인 후 노래 추가/삭제, 요청·감상평 확인 및 정리
- 숙련도(잘함 / 어버버 / ㅠㅠ)는 오타마톤의 긴 목처럼 생긴 페이더로 표시됩니다

## 기술 스택

- React + Vite
- React Router (HashRouter — GitHub Pages 배포 시 서버 설정 없이 라우팅 가능)
- Firebase (Firestore: 데이터 저장 / Authentication: 관리자 로그인)
- GitHub Actions + GitHub Pages 배포

## 1. Firebase 프로젝트 준비

1. [Firebase 콘솔](https://console.firebase.google.com)에서 새 프로젝트를 만듭니다.
2. **Firestore Database**를 만듭니다 (프로덕션 모드 선택 후, 아래 3번에서 규칙을 붙여넣습니다).
3. Firestore **규칙(Rules)** 탭에 이 저장소의 [`firestore.rules`](./firestore.rules) 내용을 그대로 붙여넣고 게시합니다.
   - 이 규칙은 노래 목록은 누구나 볼 수 있지만, 추가/삭제는 로그인한 관리자만 가능하도록 되어 있습니다.
   - 노래 요청과 감상평은 방문자가 자유롭게 남길 수 있고, 삭제(정리)는 관리자만 가능합니다.
4. **Authentication > Sign-in method**에서 "이메일/비밀번호" 제공업체를 사용 설정합니다.
5. **Authentication > Users** 탭에서 관리자 계정을 하나 만듭니다.
   - 이메일은 아무 값이나 상관없습니다 (예: `admin@miku-songbook.local`). 방문자에게 노출되지 않고, 관리자 페이지에서는 비밀번호만 입력하면 됩니다.
   - 비밀번호는 실제로 로그인할 때 사용할 값으로 설정합니다.
6. 프로젝트 설정 > 일반 탭에서 "웹 앱 추가"를 하고, 나오는 `firebaseConfig` 값을 기억해둡니다.

## 2. 로컬 개발 환경 설정

```bash
npm install
cp .env.example .env
```

`.env` 파일을 열어 Firebase 설정 값과 관리자 이메일을 채워 넣습니다.

```bash
npm run dev
```

## 3. GitHub에 올리고 자동 배포하기

이 저장소에는 `main` 브랜치에 푸시하면 자동으로 GitHub Pages에 배포하는 GitHub Actions 워크플로우(`.github/workflows/deploy.yml`)가 포함되어 있습니다.

1. GitHub에 새 저장소를 만들고 이 프로젝트를 푸시합니다.
2. 저장소 **Settings > Secrets and variables > Actions**에서 아래 값들을 Repository secret으로 등록합니다 (`.env`에 적은 값과 동일):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_ADMIN_EMAIL`
3. 저장소 **Settings > Pages**에서 Source를 "GitHub Actions"로 선택합니다.
4. `main` 브랜치에 푸시하면 자동으로 빌드 및 배포되고, 완료되면 `https://<사용자명>.github.io/<저장소명>/`에서 접속할 수 있습니다.

## 폴더 구조

```
src/
  components/    OtamatoneFader, Header, SongCard 등 공용 컴포넌트
  pages/         Home(검색), Request(요청), Reviews(감상평), Admin(관리자)
  lib/           숙련도 상수 등 공용 로직
  firebase.js    Firebase 초기화
firestore.rules  Firestore 보안 규칙
```

## 참고

- 관리자 로그인은 Firebase Authentication을 사용하므로, 브라우저 개발자 도구로 우회할 수 없는 실제 서버 측 권한 검사입니다.
- 노래 요청/감상평은 별도 인증 없이 누구나 작성할 수 있어 스팸에 노출될 수 있습니다. 개인/친목 용도가 아니라면 Firestore에 reCAPTCHA(App Check) 등을 추가하는 것을 고려하세요.
