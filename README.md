# 시헌테크 A/S 매뉴얼 시스템

프린터 및 공기청정기 A/S 매뉴얼 관리 시스템

## 🚀 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Hosting**: Cloudflare Pages

## 📁 프로젝트 구조

```
├── index.html          # 사용자 페이지
├── admin.html          # 관리자 페이지
├── login.html          # 로그인 페이지
├── css/
│   └── style.css       # 스타일시트
└── js/
    ├── config.js       # Supabase 설정
    ├── main-supabase.js    # 사용자 페이지 로직
    ├── admin-supabase.js   # 관리자 페이지 로직
    └── auth.js         # 인증 로직
```

## ⚙️ 설정

`js/config.js` 파일에서 Supabase 정보 설정:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

## 🌐 배포

Cloudflare Pages 또는 정적 호스팅 서비스에 배포

## 📄 라이선스

MIT License
