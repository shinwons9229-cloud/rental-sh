// 관리자 페이지 - 장비 모델 관리
(function () {
  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  let rows = [];

  async function loadRows() {
    rows = await window.STEquipmentModels.getAllRows();
    render();
  }

  function render() {
    const category = document.getElementById('modelManageCategory');
    const manufacturer = document.getElementById('modelManageManufacturer');
    const tbody = document.getElementById('equipmentModelList');
    if (!category || !manufacturer || !tbody) return;

    const catalog = window.STEquipmentModels.buildCatalog(rows);
    const oldCategory = category.value;
    category.innerHTML = '<option value="">카테고리 선택</option>' +
      Object.keys(catalog).map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    if (catalog[oldCategory]) category.value = oldCategory;
    updateManufacturers();

    tbody.innerHTML = rows.map((row) => `
      <tr>
        <td>${esc(row.category)}</td>
        <td>${esc(row.manufacturer)}</td>
        <td><strong>${esc(row.model)}</strong></td>
        <td>${row.id ? `<button type="button" class="btn btn-danger btn-sm" onclick="deleteEquipmentModel(${Number(row.id)})">삭제</button>` : '<span style="color:#8ea1c8;font-size:12px;">기본 모델</span>'}</td>
      </tr>`).join('');
  }

  function updateManufacturers() {
    const categoryEl = document.getElementById('modelManageCategory');
    const manufacturerEl = document.getElementById('modelManageManufacturer');
    const newWrap = document.getElementById('newManufacturerWrap');
    if (!categoryEl || !manufacturerEl) return;
    const catalog = window.STEquipmentModels.buildCatalog(rows);
    const names = Object.keys(catalog[categoryEl.value] || {});
    manufacturerEl.innerHTML = '<option value="">제조사 선택</option>' +
      names.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('') +
      '<option value="__new__">+ 새 제조사 직접 입력</option>';
    if (newWrap) newWrap.style.display = 'none';
  }

  function toggleNewManufacturer() {
    const manufacturerEl = document.getElementById('modelManageManufacturer');
    const wrap = document.getElementById('newManufacturerWrap');
    if (wrap) wrap.style.display = manufacturerEl && manufacturerEl.value === '__new__' ? 'block' : 'none';
  }

  async function add(event) {
    event.preventDefault();
    const category = document.getElementById('modelManageCategory')?.value || '';
    const selected = document.getElementById('modelManageManufacturer')?.value || '';
    const newMf = document.getElementById('newManufacturer')?.value.trim() || '';
    const manufacturer = selected === '__new__' ? newMf : selected;
    const model = document.getElementById('newModelName')?.value.trim() || '';
    if (!category || !manufacturer || !model) {
      if (typeof showNotification === 'function') showNotification('카테고리, 제조사, 모델명을 모두 입력하세요.', 'error');
      return;
    }

    const client = await window.STEquipmentModels.waitForClient();
    if (!client) {
      if (typeof showNotification === 'function') showNotification('Supabase 연결을 확인해주세요.', 'error');
      return;
    }

    const maxSort = rows.reduce((m, r) => Math.max(m, Number(r.sort_order) || 0), 0);
    const { error } = await client.from('equipment_models').insert({ category, manufacturer, model, sort_order: maxSort + 10 });
    if (error) {
      console.error('[모델관리] 추가 실패:', error);
      const msg = String(error.message || '');
      if (typeof showNotification === 'function') showNotification(msg.toLowerCase().includes('duplicate') ? '이미 등록된 모델입니다.' : `모델 추가 실패: ${msg}`, 'error');
      return;
    }

    document.getElementById('newModelName').value = '';
    if (document.getElementById('newManufacturer')) document.getElementById('newManufacturer').value = '';
    if (typeof showNotification === 'function') showNotification(`${manufacturer} ${model} 모델을 추가했습니다.`, 'success');
    await loadRows();

    // 기존 매뉴얼 작성 폼의 하드코딩 데이터에도 즉시 추가(페이지 새로고침 없이 사용 가능)
    try {
      if (typeof manufacturersData === 'object' && manufacturersData) {
        manufacturersData[category] ||= {};
        manufacturersData[category][manufacturer] ||= [];
        if (!manufacturersData[category][manufacturer].includes(model)) manufacturersData[category][manufacturer].push(model);
        if (typeof updateManufacturerOptions === 'function') updateManufacturerOptions();
      }
    } catch (_) {}
  }

  async function remove(id) {
    const row = rows.find(r => Number(r.id) === Number(id));
    if (!row) return;
    const client = await window.STEquipmentModels.waitForClient();
    if (!client) return;

    const { count, error: countError } = await client.from('manuals')
      .select('*', { count: 'exact', head: true })
      .eq('category', row.category).eq('manufacturer', row.manufacturer).eq('model', row.model);
    if (countError) {
      if (typeof showNotification === 'function') showNotification('해당 모델의 매뉴얼 확인에 실패했습니다.', 'error');
      return;
    }
    if ((count || 0) > 0) {
      if (typeof showNotification === 'function') showNotification(`이 모델에 매뉴얼이 ${count}개 있어 삭제할 수 없습니다.`, 'error');
      return;
    }
    if (!confirm(`${row.manufacturer} ${row.model} 모델을 삭제하시겠습니까?`)) return;
    const { error } = await client.from('equipment_models').delete().eq('id', id);
    if (error) {
      if (typeof showNotification === 'function') showNotification(`모델 삭제 실패: ${error.message}`, 'error');
      return;
    }
    if (typeof showNotification === 'function') showNotification('모델을 삭제했습니다.', 'success');
    await loadRows();
  }

  window.loadEquipmentModelAdmin = loadRows;
  window.updateModelManageManufacturers = updateManufacturers;
  window.toggleNewManufacturerInput = toggleNewManufacturer;
  window.addEquipmentModel = add;
  window.deleteEquipmentModel = remove;
})();
