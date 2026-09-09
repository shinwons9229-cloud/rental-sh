// js/auth.js
// Supabase Authentication 기반 관리자 로그인

const ADMIN_USER_ID = "1589903e-b1c5-41a9-96e1-d1c31d6ac1ac";

async function getSupabaseClient() {
  for (let i = 0; i < 50; i++) {
    if (window.supabase && typeof window.supabase.auth?.getSession === 'function') {
      return window.supabase;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Supabase 연결이 준비되지 않았습니다.');
}

// 로그인 시도 함수
async function adminLogin(email, password) {
  const client = await getSupabaseClient();

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('[관리자 로그인] 실패:', error);
    return false;
  }

  if (!data?.user || data.user.id !== ADMIN_USER_ID) {
    await client.auth.signOut();
    console.warn('[관리자 로그인] 허용되지 않은 계정');
    return false;
  }

  return true;
}

// 로그인 여부 확인
async function isAdminLoggedIn() {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.getSession();
    if (error) return false;

    const user = data?.session?.user;
    return !!user && user.id === ADMIN_USER_ID;
  } catch (error) {
    console.error('[관리자 인증 확인] 오류:', error);
    return false;
  }
}

// 로그아웃
async function adminLogout() {
  try {
    const client = await getSupabaseClient();
    await client.auth.signOut();
  } catch (error) {
    console.error('[관리자 로그아웃] 오류:', error);
  }
  window.location.href = 'login.html';
}

// admin 페이지 진입 시 필수 호출
async function requireAdminAuth() {
  const ok = await isAdminLoggedIn();
  if (!ok) {
    window.location.replace('login.html');
    return false;
  }
  document.documentElement.classList.add('admin-auth-ok');
  return true;
}

window.adminLogin = adminLogin;
window.isAdminLoggedIn = isAdminLoggedIn;
window.adminLogout = adminLogout;
window.requireAdminAuth = requireAdminAuth;
