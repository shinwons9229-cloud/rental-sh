# 시헌테크 홈페이지 수정본(클린 패키지)

## 포함 파일(필수만)
- index.html
- manufacturers.html
- js/config.js
- js/main-supabase.js
- js/admin-supabase.js
- js/admin-quotes.js
- js/auth.js

## 핵심 변경점
- `js/config.js`에서 Supabase 라이브러리(window.supabase)를 **클라이언트로 고정**했습니다.
  - 라이브러리 객체는 `window.supabaseLib`에 보관
  - 클라이언트는 `window.supabase`, `window.sb`, `window.supabaseClient`로 접근 가능
- manufacturers.html은 Supabase 준비 완료 후에만 로딩을 시작하도록 안전하게 수정했습니다.

## 스크립트 로딩 순서(모든 페이지 공통)
반드시 아래 순서로 포함해야 합니다.
1) supabase-js CDN
2) js/config.js
3) 페이지 스크립트(main/admin 등)

예)
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/config.js"></script>
