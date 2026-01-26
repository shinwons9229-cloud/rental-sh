// js/config.js (호환/안정 버전 v3)
// 목적:
// 1) CDN(@supabase/supabase-js@2)이 만든 전역 `supabase`(라이브러리)를 그대로 두면서
// 2) 어떤 페이지에서든 `supabase.from(...)`가 동작하도록 라이브러리 객체에 client 메서드를 주입
// 3) 동시에 `window.sb`, `window.supabaseClient` 별칭 제공

const SUPABASE_URL = 'https://udqrmdunqrpufgyweptn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcXJtZHVucXJwdWZneXdlcHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Njc4ODAsImV4cCI6MjA3OTQ0Mzg4MH0.435QqNeT02gf8fJIeRMO2lNDsG2KsDFuVfRL9muLMN0';

(function () {
  function init() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      console.error('[Supabase] 라이브러리가 아직 로드되지 않았습니다. (CDN 스크립트 순서 확인)');
      return false;
    }

    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
      tryInjectIntoLibrary(window.supabase, window.supabaseClient);
      console.log('[Supabase] 이미 초기화됨');
      return true;
    }

    try {
      const lib = window.supabase;
      const client = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      window.supabaseClient = client;
      window.sb = client;

      tryInjectIntoLibrary(lib, client);

      console.log('[Supabase] 클라이언트 초기화 완료');
      return true;
    } catch (e) {
      console.error('[Supabase] 초기화 실패:', e);
      return false;
    }
  }

  function tryInjectIntoLibrary(lib, client) {
    try {
      if (!lib || !client) return;

      lib.from = client.from.bind(client);
      if (client.rpc) lib.rpc = client.rpc.bind(client);

      lib.storage = client.storage;
      lib.auth = client.auth;
      lib.functions = client.functions;
      lib.realtime = client.realtime;

      lib.client = client;
    } catch (e) {
      console.warn('[Supabase] 라이브러리 주입 경고:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
