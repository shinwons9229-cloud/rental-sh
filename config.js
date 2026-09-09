// Supabase 설정
const SUPABASE_URL = 'https://udqrmdunqrpufgyweptn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcXJtZHVucXJwdWZneXdlcHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Njc4ODAsImV4cCI6MjA3OTQ0Mzg4MH0.435QqNeT02gf8fJIeRMO2lNDsG2KsDFuVfRL9muLMN0';

// Supabase 클라이언트 초기화
// 중요: 페이지 하단의 인라인 스크립트가 즉시 DB를 조회하므로,
// CDN이 이미 로드된 경우 DOMContentLoaded를 기다리지 않고 바로 초기화합니다.
(function () {
    function initSupabase() {
        // 이미 createClient()로 생성된 클라이언트라면 그대로 사용
        if (window.supabase && typeof window.supabase.from === 'function') {
            console.log('Supabase 이미 초기화됨');
            return true;
        }

        // CDN 라이브러리가 아직 준비되지 않은 경우
        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            return false;
        }

        try {
            const supabaseLib = window.supabase;
            window.supabase = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase 초기화 완료');
            return true;
        } catch (error) {
            console.error('Supabase 초기화 실패:', error);
            return false;
        }
    }

    // <script src="...supabase-js..."> 다음에 config.js가 로드되므로 보통 여기서 즉시 성공합니다.
    if (!initSupabase()) {
        // 혹시 CDN 로딩이 늦는 환경을 대비한 재시도
        let attempts = 0;
        const timer = setInterval(function () {
            attempts += 1;
            if (initSupabase() || attempts >= 50) {
                clearInterval(timer);
                if (attempts >= 50 && (!window.supabase || typeof window.supabase.from !== 'function')) {
                    console.error('Supabase 클라이언트를 초기화하지 못했습니다. 네트워크/CDN 상태를 확인하세요.');
                }
            }
        }, 100);
    }
})();
