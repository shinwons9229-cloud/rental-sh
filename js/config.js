// Supabase 설정
const SUPABASE_URL = 'https://udqrmdunqrpufgyweptn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcXJtZHVucXJwdWZneXdlcHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Njc4ODAsImV4cCI6MjA3OTQ0Mzg4MH0.435QqNeT02gf8fJIeRMO2lNDsG2KsDFuVfRL9muLMN0';

// Supabase 클라이언트 초기화
(function() {
    // Supabase CDN 라이브러리가 로드될 때까지 대기
    function initSupabase() {
        if (typeof window.supabase?.createClient !== 'function') {
            console.error('Supabase 라이브러리가 로드되지 않았습니다.');
            return false;
        }
        
        // 이미 클라이언트가 생성되었는지 확인 (from 메소드 존재 여부로 체크)
        if (window.supabase?.from) {
            console.log('Supabase 이미 초기화됨');
            return true;
        }
        
        try {
            // Supabase 클라이언트 생성
            const supabaseLib = window.supabase;
            window.supabase = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase 초기화 완료');
            return true;
        } catch (error) {
            console.error('Supabase 초기화 실패:', error);
            return false;
        }
    }
    
    // 페이지 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupabase);
    } else {
        initSupabase();
    }
})();
