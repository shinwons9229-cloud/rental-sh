# 🚀 GitHub + Cloudflare Pages 배포 가이드

## 📦 현재 프로젝트 구조 (배포 준비 완료)

```
sihyuntech-project/
├── index.html              # 사용자 페이지
├── admin.html              # 관리자 페이지
├── login.html              # 로그인 페이지
├── README.md               # 프로젝트 설명
├── .gitignore              # Git 제외 파일
├── css/
│   └── style.css
└── js/
    ├── config.js           # Supabase 설정 (키 포함)
    ├── main-supabase.js
    ├── admin-supabase.js
    └── auth.js
```

---

## 1️⃣ GitHub에 업로드

### 방법 A: GitHub Desktop 사용 (추천)

1. **GitHub Desktop 설치**
   - https://desktop.github.com 다운로드

2. **Repository 생성**
   - File → New Repository
   - Name: `sihyuntech-manuals`
   - Local Path: 프로젝트 폴더 선택
   - Initialize with README: 체크 해제 (이미 있음)

3. **Commit & Push**
   - 모든 파일 선택됨 확인
   - Summary: `Initial commit`
   - Commit to main
   - Publish repository (Public 선택)

### 방법 B: Git 명령어 사용

```bash
# 프로젝트 폴더로 이동
cd /path/to/sihyuntech-project

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit"

# GitHub 저장소와 연결
git remote add origin https://github.com/YOUR_USERNAME/sihyuntech-manuals.git

# 업로드
git branch -M main
git push -u origin main
```

---

## 2️⃣ Cloudflare Pages 연동

### 단계 1: Cloudflare Pages 프로젝트 생성

1. https://dash.cloudflare.com 로그인
2. **Workers & Pages** 클릭
3. **Create application** 클릭
4. **Pages** 탭 선택
5. **Connect to Git** 선택

### 단계 2: GitHub 연동

1. **Connect GitHub** 클릭
2. GitHub 계정 인증
3. 저장소 선택: `sihyuntech-manuals`
4. **Begin setup** 클릭

### 단계 3: 빌드 설정

```
Project name: sihyuntech-manuals
Production branch: main
Build command: (비워두기)
Build output directory: /
```

### 단계 4: 배포

1. **Save and Deploy** 클릭
2. ⏳ 배포 대기 (1-2분)
3. ✅ 배포 URL 확인: `https://sihyuntech-manuals.pages.dev`

---

## 3️⃣ 도메인 연결

### rental-sh.com 연결

1. **Custom domains** 탭 클릭
2. **Set up a custom domain** 클릭
3. 도메인 입력: `rental-sh.com`
4. **Activate domain** 클릭
5. DNS 자동 설정 (Cloudflare DNS 사용 시)

---

## 🔄 업데이트 방법

### GitHub Desktop

1. 파일 수정
2. GitHub Desktop 열기
3. 변경사항 확인
4. Commit message 입력
5. **Commit to main**
6. **Push origin** 클릭
7. Cloudflare가 자동 재배포 (1-2분)

### Git 명령어

```bash
# 파일 수정 후
git add .
git commit -m "Update: 설명"
git push
```

---

## ✅ 완료 확인

- [ ] GitHub 저장소 생성 완료
- [ ] 코드 업로드 완료
- [ ] Cloudflare Pages 연동 완료
- [ ] 자동 배포 확인
- [ ] https://sihyuntech-manuals.pages.dev 접속 가능
- [ ] rental-sh.com 도메인 연결 완료
- [ ] 매뉴얼 목록 정상 표시
- [ ] 관리자 페이지 정상 작동

---

## 🎯 장점

### 자동 배포
- GitHub에 push → 자동으로 Cloudflare 배포
- 별도 업로드 불필요

### 버전 관리
- Git으로 모든 변경사항 추적
- 이전 버전으로 롤백 가능

### 협업 가능
- 여러 명이 함께 작업 가능
- Pull Request로 코드 리뷰

---

## 🔒 보안 주의사항

`config.js`에 Supabase 키가 포함되어 있습니다.

**Public Repository인 경우:**
- anon public key는 공개되어도 안전함
- Row Level Security (RLS) 설정으로 보호됨
- service_role key는 절대 업로드 금지

**더 안전하게:**
- Private Repository 사용 권장
- Cloudflare Pages Environment Variables 사용

---

**배포 성공!** 🎉

이제 GitHub에서 코드 관리하고, Cloudflare가 자동으로 배포합니다!
