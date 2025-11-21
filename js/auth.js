// js/auth.js

// 관리자 계정 정보 (실제 운영 시에는 값만 변경해서 사용)
const ADMIN_CREDENTIALS = {
  id: "shrental",        // 관리자 아이디
  pw: "bang3477!!"       // 관리자 비밀번호
};

const AUTH_KEY = "st_admin_token_v1";

// 로그인 시도 함수
function adminLogin(inputId, inputPw) {
  if (inputId === ADMIN_CREDENTIALS.id && inputPw === ADMIN_CREDENTIALS.pw) {
    localStorage.setItem(AUTH_KEY, "ok");
    return true;
  }
  return false;
}

// 로그인 여부 확인
function isAdminLoggedIn() {
  return localStorage.getItem(AUTH_KEY) === "ok";
}

// 로그아웃
function adminLogout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "login.html";
}

// admin 페이지 진입 시 필수 호출
function requireAdminAuth() {
  if (!isAdminLoggedIn()) {
    window.location.href = "login.html";
  }
}
