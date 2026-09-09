// 시헌테크 장비 모델 공통 유틸리티
// 기존 사이트 동작을 절대 막지 않도록 설계: DB 조회 실패 시 기존 하드코딩 목록을 그대로 사용합니다.

window.STEquipmentModels = (function () {
  const DEFAULT_ROWS = [
    ['잉크젯 프린터','캐논','GX 공통'], ['잉크젯 프린터','캐논','GX5090시리즈'], ['잉크젯 프린터','캐논','GX6090시리즈'], ['잉크젯 프린터','캐논','GX7090시리즈'],
    ['잉크젯 프린터','HP','HP 공통 (A4)'], ['잉크젯 프린터','HP','HP 공통 (A3)'], ['잉크젯 프린터','HP','OJ7720'], ['잉크젯 프린터','HP','OJ7740'], ['잉크젯 프린터','HP','OJ9730'], ['잉크젯 프린터','HP','OJ9120'], ['잉크젯 프린터','HP','OJ8710'], ['잉크젯 프린터','HP','OJ8210'],
    ['잉크젯 프린터','앱손','앱손 공통'], ['잉크젯 프린터','앱손','L6270'],
    ['레이저 프린터','캐논','캐논 공통'], ['레이저 프린터','캐논','C3725'], ['레이저 프린터','캐논','C3826'], ['레이저 프린터','캐논','C3926'],
    ['레이저 프린터','삼성','삼성 공통'], ['레이저 프린터','삼성','X3220'], ['레이저 프린터','삼성','X4300'],
    ['레이저 프린터','리코','리코 공통'], ['레이저 프린터','리코','C2010'], ['레이저 프린터','리코','C2510'], ['레이저 프린터','리코','C3510'], ['레이저 프린터','리코','IM2500'], ['레이저 프린터','리코','IM3000'],
    ['공기청정기','웰리핏','SH-3025'], ['공기청정기','웰리핏','SH-4025']
  ].map((r, i) => ({ id: null, category: r[0], manufacturer: r[1], model: r[2], sort_order: (i + 1) * 10 }));

  function waitForClient(timeoutMs = 4000) {
    return new Promise((resolve) => {
      const started = Date.now();
      const check = () => {
        if (window.supabase && typeof window.supabase.from === 'function') return resolve(window.supabase);
        if (Date.now() - started >= timeoutMs) return resolve(null);
        setTimeout(check, 50);
      };
      check();
    });
  }

  function mergeRows(baseRows, extraRows) {
    const out = [];
    const seen = new Set();
    [...(baseRows || []), ...(extraRows || [])].forEach((row) => {
      if (!row || !row.category || !row.manufacturer || !row.model) return;
      const key = `${row.category}\u0000${row.manufacturer}\u0000${row.model}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(row);
    });
    return out;
  }

  function buildCatalog(rows) {
    const catalog = {};
    (rows || []).forEach((row) => {
      if (!catalog[row.category]) catalog[row.category] = {};
      if (!catalog[row.category][row.manufacturer]) catalog[row.category][row.manufacturer] = [];
      if (!catalog[row.category][row.manufacturer].includes(row.model)) {
        catalog[row.category][row.manufacturer].push(row.model);
      }
    });
    return catalog;
  }

  async function getDbRows() {
    try {
      const client = await waitForClient();
      if (!client) return [];
      const { data, error } = await client
        .from('equipment_models')
        .select('id, category, manufacturer, model, sort_order')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });
      if (error) {
        console.warn('[모델관리] equipment_models 조회 실패 - 기존 목록으로 계속 동작:', error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('[모델관리] equipment_models 조회 예외 - 기존 목록으로 계속 동작:', error);
      return [];
    }
  }

  async function getAllRows() {
    return mergeRows(DEFAULT_ROWS, await getDbRows());
  }

  async function getCatalog() {
    return buildCatalog(await getAllRows());
  }

  return { DEFAULT_ROWS, waitForClient, mergeRows, buildCatalog, getDbRows, getAllRows, getCatalog };
})();
