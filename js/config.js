// js/config.js
// 시헌테크 Supabase 공용 설정 (supabase-js v2 CDN)
//
// ✅ 원칙
// - window.supabase : Supabase 라이브러리(=createClient 포함). 절대 덮어쓰지 않습니다.
// - window.sb      : Supabase 클라이언트(=from/storage 등 실제 사용).
// - 여러 페이지/스크립트에서 config.js가 중복 로드되어도 안전합니다.

(function () {
  'use strict';

  const SUPABASE_URL = 'https://udqrmdunqrpufgyweptn.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcXJtZHVucXJwdWZneXdlcHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Njc4ODAsImV4cCI6MjA3OTQ0Mzg4MH0.435QqNeT02gf8fJIeRMO2lNDsG2KsDFuVfRL9muLMN0';

  function hasLib() {
    return typeof window.supabase?.createClient === 'function';
  }

  function init() {
    // 이미 클라이언트가 있으면 재생성하지 않음
    if (window.sb && typeof window.sb.from === 'function') return true;

    if (!hasLib()) {
      console.error('[Supabase] 라이브러리가 아직 로드되지 않았습니다. (CDN script 순서 확인)');
      return false;
    }

    try {
      window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      // 기존 코드 호환: 일부 파일에서 window.supabaseClient를 참조할 수도 있어 같이 제공
      window.supabaseClient = window.sb;
      console.log('[Supabase] 클라이언트 초기화 완료');
      return true;
    } catch (e) {
      console.error('[Supabase] 클라이언트 초기화 실패:', e);
      return false;
    }
  }

  // DOMContentLoaded 시점에 초기화(라이브러리 로드 이후가 보장되도록)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
