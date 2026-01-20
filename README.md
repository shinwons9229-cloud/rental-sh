# 시헌테크 A/S 매뉴얼 시스템

제조사별 / 모델별로 분류된 프린터 및 공기청정기 A/S 매뉴얼 관리 시스템

---

## 🚀 빠른 시작

### "매뉴얼 등록했는데 안보여요" 해결법

```bash
1. Supabase SQL Editor 열기
2. supabase-setup.sql 파일 내용 전체 복사
3. SQL Editor에 붙여넣고 Run 클릭
4. test-connection.html로 연결 테스트
5. index.html에서 정상 작동 확인
```

📖 **자세한 방법**: [QUICK_START.md](QUICK_START.md) 참조 (5분 소요)

---

## 🚀 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage / ImgBB
- **Hosting**: Cloudflare Pages

## 📁 프로젝트 구조

```
├── index.html                  # 메인 홈페이지 (카테고리 선택)
├── manufacturers.html          # 제조사 목록 페이지
├── models.html                 # 모델 목록 페이지
├── manuals.html                # 매뉴얼 목록 페이지 (모델별)
├── manual-detail.html          # 매뉴얼 상세 페이지
├── admin.html                  # 관리자 페이지 (매뉴얼 등록/수정/삭제)
├── login.html                  # 로그인 페이지
├── test-connection.html        # 🔧 Supabase 연결 테스트 페이지
├── supabase-setup.sql          # 📝 Supabase 초기화 SQL 스크립트
├── SUPABASE_SETUP.md           # 📖 Supabase 설정 가이드
├── css/
│   └── style.css              # 스타일시트
└── js/
    ├── config.js              # Supabase 설정
    ├── main-supabase.js       # 사용자 페이지 로직 (deprecated)
    ├── admin-supabase.js      # 관리자 페이지 로직
    └── auth.js                # 인증 로직
```

## 🗂️ 페이지 구조 및 흐름

### 사용자 페이지 흐름
```
1. index.html (홈)
   ↓ 카테고리 선택 (잉크젯 프린터 / 레이저 프린터 / 공기청정기)
   
2. manufacturers.html?category={카테고리}
   ↓ 제조사 선택 (예: 캐논, HP, 삼성 등)
   
3. models.html?category={카테고리}&manufacturer={제조사}
   ↓ 모델 선택 (예: GX50시리즈, OJ7720 등)
   
4. manuals.html?category={카테고리}&manufacturer={제조사}&model={모델}
   ↓ 매뉴얼 선택
   
5. manual-detail.html?id={매뉴얼ID}
   - 매뉴얼 상세 내용 조회
   - 이미지/동영상 미디어 확인
```

### 카테고리 및 제조사/모델 구조

#### 잉크젯 프린터
- **캐논**: GX5090시리즈, GX6090시리즈, GX7090시리즈, GX 공통
- **HP**: OJ7720, OJ7740, OJ9730, OJ9120, OJ8710, OJ8210
- **앱손**: L6270

#### 레이저 프린터
- **캐논**: C3725, C3826, C3926
- **삼성**: X3220, X4300
- **리코**: C2010, C2510, C3510, IM2500, IM3000

#### 공기청정기
- **웰리핏**: SH-3025, SH-4025

## 💾 데이터베이스 스키마

### manuals 테이블
| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | text | 고유 ID (UUID) |
| title | text | 매뉴얼 제목 |
| category | text | 카테고리 (잉크젯 프린터/레이저 프린터/공기청정기) |
| manufacturer | text | 제조사명 |
| model | text | 모델명 |
| content | rich_text | 매뉴얼 본문 내용 |
| tags | text | 검색용 태그 (쉼표 구분) |
| views | number | 조회수 |
| is_published | bool | 공개 여부 |
| created_at | datetime | 작성일 |
| media_urls | text | 이미지/동영상 URL (쉼표 구분) |

## ⚙️ 설정

### 🚀 빠른 시작 (3단계)

1. **Supabase 프로젝트 생성**
   - [https://supabase.com](https://supabase.com)에서 새 프로젝트 생성
   
2. **SQL 스크립트 실행**
   - Supabase SQL Editor에서 `supabase-setup.sql` 파일 실행
   - 테이블, 인덱스, RLS 정책, 샘플 데이터가 자동 생성됨
   
3. **API 키 설정**
   - `js/config.js` 파일에 Supabase URL과 API 키 입력

📖 **자세한 설정 방법은 [SUPABASE_SETUP.md](SUPABASE_SETUP.md) 참조**

---

### 1. Supabase 프로젝트 생성
- [https://supabase.com](https://supabase.com) 접속
- 새 프로젝트 생성 (Region: Seoul 권장)
- 데이터베이스 비밀번호 설정

### 2. SQL 스크립트 실행
1. Supabase 대시보드 → **SQL Editor** 클릭
2. `supabase-setup.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 **Run** 클릭
4. 성공 메시지 확인

**자동 생성되는 항목:**
- ✅ `manuals` 테이블 생성
- ✅ 인덱스 생성 (검색 성능 최적화)
- ✅ RLS 정책 자동 설정
- ✅ 12개 샘플 매뉴얼 데이터 삽입

### 3. API 키 설정
Supabase 대시보드 → **Settings** → **API**에서 복사:

`js/config.js` 파일 수정:
```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-public-key';
```

### 4. 연결 테스트
브라우저에서 `test-connection.html` 열어서 연결 확인

### 5. 관리자 계정 생성
- Supabase 대시보드 → **Authentication** → **Users**
- "Add user" 클릭하여 관리자 계정 생성
- `login.html`에서 로그인

---

### 📊 RLS 정책 (자동 설정됨)

SQL 스크립트 실행 시 자동으로 설정됩니다:

```sql
-- 모든 사용자: 공개된 매뉴얼 조회 가능
CREATE POLICY "Enable read access for all users"
ON manuals FOR SELECT
USING (is_published = true);

-- 인증된 사용자: 모든 매뉴얼 조회 가능
CREATE POLICY "Enable read access for authenticated users"
ON manuals FOR SELECT
USING (auth.role() = 'authenticated');

-- 인증된 사용자만: 생성/수정/삭제 가능
CREATE POLICY "Enable insert for authenticated users"
ON manuals FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

## 🔧 문제 해결 (Troubleshooting)

### ❌ "매뉴얼을 등록했는데 홈 화면에서 안나와요"

**해결 방법 (우선순위순):**

#### 1️⃣ Supabase 완전 초기화 (가장 확실한 방법)
```bash
1. Supabase SQL Editor 열기
2. supabase-setup.sql 파일 전체 내용 복사
3. SQL Editor에 붙여넣고 Run 클릭
4. 성공 메시지 확인
5. test-connection.html로 연결 테스트
```

이 방법으로 테이블, RLS 정책, 샘플 데이터가 모두 자동으로 올바르게 설정됩니다.

#### 2️⃣ is_published 확인
- Supabase 대시보드 → Table Editor → `manuals`
- 등록한 매뉴얼의 `is_published` 컬럼이 **true**인지 확인
- false면 체크박스 클릭하여 true로 변경

#### 3️⃣ RLS 정책 확인
- Supabase 대시보드 → Table Editor → `manuals` 테이블
- 상단의 🔒 아이콘 클릭
- "Enable RLS" 체크 확인
- 정책이 없다면 `supabase-setup.sql`의 7번 섹션만 다시 실행

#### 4️⃣ 브라우저 캐시 삭제
```
Ctrl + Shift + Delete (Windows/Linux)
Cmd + Shift + Delete (Mac)
→ 캐시된 이미지 및 파일 삭제
```

#### 5️⃣ 연결 테스트
- `test-connection.html` 실행
- 데이터베이스 통계 확인
- 오류 메시지가 있다면 지시사항 따르기

---

### ❌ "카테고리 선택 후 제조사, 모델이 안보여요"

**1. 연결 테스트 실행**
- 브라우저에서 `test-connection.html` 페이지를 엽니다
- Supabase 연결 상태와 데이터베이스 통계를 확인합니다
- 오류 메시지가 있다면 해당 지시사항을 따릅니다

**2. 브라우저 콘솔 확인**
- `F12` 키를 눌러 개발자 도구를 엽니다
- Console 탭에서 JavaScript 에러를 확인합니다
- 특히 Supabase 연결 관련 에러를 주의깊게 봅니다

**3. API 키 확인**
- `js/config.js` 파일 열기
- `SUPABASE_URL`과 `SUPABASE_ANON_KEY`가 올바른지 확인
- Supabase 대시보드 → Settings → API에서 다시 복사

**4. 데이터 존재 확인**
- Supabase 대시보드 → Table Editor → `manuals` 테이블
- 데이터가 있는지, `is_published`가 `true`인지 확인
- 없다면 `supabase-setup.sql` 실행으로 샘플 데이터 생성

---

### 📖 상세한 해결 방법

모든 문제 해결 방법은 **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** 문서를 참조하세요.

## 🔐 관리자 기능

### 로그인
- `login.html`에서 관리자 로그인
- Supabase Auth를 사용한 인증

### 매뉴얼 관리
1. **등록**: 제목, 카테고리, 제조사, 모델, 내용, 태그, 미디어 첨부
2. **수정**: 기존 매뉴얼 수정 가능
3. **삭제**: 매뉴얼 삭제
4. **공개/비공개**: 매뉴얼 공개 상태 관리

### 미디어 업로드
- **이미지**: ImgBB 또는 Supabase Storage 업로드
- **동영상**: URL 직접 입력 (YouTube 임베드 또는 직접 호스팅)

## 🌐 기능 목록

### ✅ 완료된 기능
- [x] 카테고리별 매뉴얼 분류 (잉크젯/레이저/공기청정기)
- [x] 제조사별 매뉴얼 분류
- [x] 모델별 매뉴얼 분류
- [x] 4단계 계층 구조 (카테고리 → 제조사 → 모델 → 매뉴얼)
- [x] 매뉴얼 상세 페이지 (이미지/동영상 포함)
- [x] 조회수 트래킹
- [x] 검색 기능 (제목, 내용, 태그)
- [x] 페이지네이션
- [x] 브레드크럼 네비게이션
- [x] 관리자 인증 시스템
- [x] 매뉴얼 CRUD (생성/읽기/수정/삭제)
- [x] 미디어 업로드 (이미지/동영상)
- [x] 공개/비공개 설정
- [x] 반응형 디자인

### 🔜 향후 개선 사항
- [ ] 제조사/모델 동적 추가 기능
- [ ] 매뉴얼 검색 통합 (전체 카테고리 검색)
- [ ] 인기 매뉴얼 대시보드
- [ ] 매뉴얼 즐겨찾기 기능
- [ ] PDF 다운로드 기능
- [ ] 매뉴얼 댓글 시스템
- [ ] 다국어 지원

## 🎯 페이지별 기능 요약

| 페이지 | URL | 주요 기능 |
|--------|-----|----------|
| 홈 | `/index.html` | 카테고리 선택, 전체 매뉴얼 개수 표시 |
| 제조사 목록 | `/manufacturers.html?category=...` | 선택한 카테고리의 제조사 목록, 제조사별 매뉴얼 개수 |
| 모델 목록 | `/models.html?category=...&manufacturer=...` | 선택한 제조사의 모델 목록, 모델별 매뉴얼 개수 |
| 매뉴얼 목록 | `/manuals.html?category=...&manufacturer=...&model=...` | 선택한 모델의 매뉴얼 목록, 검색/페이지네이션 |
| 매뉴얼 상세 | `/manual-detail.html?id=...` | 매뉴얼 전체 내용, 미디어 갤러리, 조회수 증가 |
| 관리자 | `/admin.html` | 매뉴얼 등록/수정/삭제 관리 |
| 로그인 | `/login.html` | 관리자 인증 |

## 📱 반응형 디자인

- **Desktop**: 3열 그리드 레이아웃
- **Tablet**: 2열 그리드 레이아웃
- **Mobile**: 1열 스택 레이아웃

## 🔧 개발 가이드

### 제조사/모델 추가하기
`js/admin-supabase.js` 파일의 `manufacturersData` 객체 수정:

```javascript
const manufacturersData = {
    '잉크젯 프린터': {
        '캐논': ['GX50시리즈', 'GX6090시리즈', ...],
        'HP': ['OJ7720', 'OJ7740', ...],
        '새로운제조사': ['모델1', '모델2', ...]  // 추가
    },
    // ...
};
```

동일한 데이터를 다음 파일들에도 추가:
- `manufacturers.html` (제조사 목록 페이지)
- `models.html` (모델 목록 페이지)

### 로컬 개발 환경
```bash
# 정적 파일 서버 실행 (예: Python)
python -m http.server 8000

# 또는 Node.js
npx http-server -p 8000

# 브라우저에서 접속
http://localhost:8000
```

## 🚀 배포

### Cloudflare Pages 배포
1. Cloudflare Pages 프로젝트 생성
2. GitHub 리포지토리 연결
3. 빌드 설정:
   - Build command: (없음 - 정적 사이트)
   - Build output directory: `/`
4. 환경 변수 설정 불필요 (클라이언트 사이드에서 직접 설정)

### 기타 호스팅
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📄 라이선스

MIT License

## 👨‍💻 유지보수

### 데이터 백업
- Supabase 대시보드에서 정기적으로 데이터베이스 백업
- Storage 버킷 백업 (이미지/동영상 파일)

### 모니터링
- Supabase 대시보드에서 사용량 확인
- 조회수 통계 분석

---

**시헌테크 A/S 매뉴얼 시스템** | © 2025 시헌테크
