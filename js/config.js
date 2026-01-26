// js/config.js (SiheonTech 안정화 v4)
// ✅ 목표: 어떤 페이지에서도 `supabase.from(...)`가 항상 동작하도록 전역 supabase를 "클라이언트"로 고정
// - CDN(@supabase/supabase-js@2)이 만든 라이브러리 객체는 window.supabaseLib 로 보관
// - 실제 클라이언트는 window.supabase / window.sb / window.supabaseClient 로 제공
// - 중복 로드되어도 재초기화하지 않음

const SUPABASE_URL = 'https://udqrmdunqrpufgyweptn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcXJtZHVucXJwdWZneXdlcHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Njc4ODAsImV4cCI6MjA3OTQ0Mzg4MH0.435QqNeT02gf8fJIeRMO2lNDsG2KsDFuVfRL9muLMN0';

(function () {
  // 이미 클라이언트가 있으면 그대로 사용
  if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
    window.supabase = window.supabaseClient;
    window.sb = window.supabaseClient;
    console.log('[Supabase] 이미 초기화됨');
    return;
  }

  // CDN 라이브러리 확인
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[Supabase] 라이브러리가 아직 로드되지 않았습니다. (CDN 스크립트가 config.js보다 먼저 와야 함)');
    return;
  }

  try {
    // 라이브러리 보관
    window.supabaseLib = window.supabase;

    // 클라이언트 생성
    const client = window.supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 전역 클라이언트 고정 (기존 코드 호환: supabase.from 가능)
    window.supabaseClient = client;
    window.supabase = client;
    window.sb = client;

    console.log('[Supabase] 클라이언트 초기화 완료');
  } catch (e) {
    console.error('[Supabase] 초기화 실패:', e);
  }
})();
