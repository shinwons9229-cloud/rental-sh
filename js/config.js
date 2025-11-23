// Supabase 설정
const SUPABASE_URL = 'https://udqrmdunqrpufgyweptn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcXJtZHVucXJwdWZneXdlcHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Njc4ODAsImV4cCI6MjA3OTQ0Mzg4MH0.435QqNeT02gf8fJIeRMO2lNDsG2KsDFuVfRL9muLMN0';

// Supabase 클라이언트 (CDN 버전 사용)
// HTML에서 먼저 로드: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

let supabase;

// 초기화 함수
function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase 라이브러리가 로드되지 않았습니다.');
        return;
    }
    
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase 초기화 완료');
}

// 페이지 로드 시 초기화
if (typeof window !== 'undefined') {
    initSupabase();
}
