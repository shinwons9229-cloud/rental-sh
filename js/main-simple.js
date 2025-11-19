// 시헌테크 - 관리자 페이지 JavaScript (localStorage 버전)

let currentPage = 1;
let currentCategory = 'all';
let editingManualId = null;
let deleteTargetId = null;
const limit = 10;

// 로컬 스토리지 키
const STORAGE_KEY = 'sihyuntech_manuals';

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

// 관리자 페이지 초기화
function initializeAdmin() {
    setupEventListeners();
    loadAdminManuals();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 매뉴얼 폼 제출
    document.getElementById('manualForm').addEventListener('submit', handleFormSubmit);
    
    // 취소 버튼
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
    
    // 카테고리 필터
    document.getElementById('adminCategoryFilter').addEventListener('change', function() {
        currentCategory = this.value;
        currentPage = 1;
        loadAdminManuals();
    });
    
    // 삭제 모달 버튼들
    document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
    document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
    document.querySelector('#deleteModal .modal-overlay').addEventListener('click', closeDeleteModal);
}

// 로컬 스토리지에서 매뉴얼 가져오기
function getManuals() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// 로컬 스토리지에 매뉴얼 저장하기
function saveManuals(manuals) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(manuals));
}

// 고유 ID 생성
function generateId() {
    return 'manual_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 폼 제출 처리
function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '처리 중...';
    
    try {
        const manuals = getManuals();
        
        const formData = {
            id: editingManualId || generateId(),
            title: document.getElementById('title').value.trim(),
            category: document.getElementById('category').value,
            content: document.getElementById('content').value.trim(),
            tags: document.getElementById('tags').value.trim(),
            is_published: document.getElementById('isPublished').checked,
            views: 0,
            created_at: Date.now(),
            updated_at: Date.now()
        };
        
        if (editingManualId) {
            // 수정
            const index = manuals.findIndex(m => m.id === editingManualId);
            if (index !== -1) {
                formData.views = manuals[index].views; // 조회수 유지
                formData.created_at = manuals[index].created_at; // 작성일 유지
                manuals[index] = formData;
            }
            showNotification('매뉴얼이 수정되었습니다.', 'success');
        } else {
            // 신규 등록
            manuals.unshift(formData); // 맨 앞에 추가
            showNotification('매뉴얼이 등록되었습니다.', 'success');
        }
        
        saveManuals(manuals);
        resetForm();
        loadAdminManuals();
        
    } catch (error) {
        console.error('폼 제출 오류:', error);
        showNotification('오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// 폼 리셋
function resetForm() {
    document.getElementById('manualForm').reset();
    document.getElementById('manualId').value = '';
    editingManualId = null;
    
    document.getElementById('submitBtn').textContent = '등록하기';
    document.getElementById('cancelBtn').style.display = 'none';
    
    // 스크롤을 폼 상단으로
    document.querySelector('.admin-section').scrollIntoView({ behavior: 'smooth' });
}

// 관리자 매뉴얼 리스트 로드
function loadAdminManuals() {
    const loadingState = document.getElementById('adminLoadingState');
    const emptyState = document.getElementById('adminEmptyState');
    const manualList = document.getElementById('adminManualList');
    
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    manualList.innerHTML = '';
    
    try {
        let manuals = getManuals();
        
        // 카테고리 필터링
        if (currentCategory !== 'all') {
            manuals = manuals.filter(manual => manual.category === currentCategory);
        }
        
        loadingState.style.display = 'none';
        
        if (manuals.length === 0) {
            emptyState.style.display = 'block';
        } else {
            // 페이지네이션 적용
            const startIndex = (currentPage - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedManuals = manuals.slice(startIndex, endIndex);
            
            renderAdminManuals(paginatedManuals);
            renderAdminPagination(manuals.length);
        }
        
    } catch (error) {
        console.error('매뉴얼 로드 실패:', error);
        loadingState.style.display = 'none';
        emptyState.style.display = 'block';
    }
}

// 관리자 매뉴얼 테이블 렌더링
function renderAdminManuals(manuals) {
    const manualList = document.getElementById('adminManualList');
    manualList.innerHTML = '';
    
    manuals.forEach(manual => {
        const row = createAdminManualRow(manual);
        manualList.appendChild(row);
    });
}

// 관리자 매뉴얼 행 생성
function createAdminManualRow(manual) {
    const row = document.createElement('tr');
    
    const createdDate = new Date(manual.created_at || Date.now()).toLocaleDateString('ko-KR');
    const statusClass = manual.is_published ? 'status-published' : 'status-draft';
    const statusText = manual.is_published ? '공개' : '비공개';
    
    row.innerHTML = `
        <td class="table-title">${escapeHtml(manual.title)}</td>
        <td>${escapeHtml(manual.category)}</td>
        <td>${manual.views || 0}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${createdDate}</td>
        <td>
            <div class="table-actions">
                <button class="btn btn-secondary btn-sm" onclick="editManual('${manual.id}')">수정</button>
                <button class="btn btn-danger btn-sm" onclick="deleteManual('${manual.id}')">삭제</button>
            </div>
        </td>
    `;
    
    return row;
}

// 매뉴얼 수정
function editManual(manualId) {
    const manuals = getManuals();
    const manual = manuals.find(m => m.id === manualId);
    
    if (!manual) {
        showNotification('매뉴얼을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 폼에 데이터 채우기
    document.getElementById('manualId').value = manual.id;
    document.getElementById('title').value = manual.title;
    document.getElementById('category').value = manual.category;
    document.getElementById('content').value = manual.content;
    document.getElementById('tags').value = manual.tags || '';
    document.getElementById('isPublished').checked = manual.is_published;
    
    editingManualId = manual.id;
    
    // 버튼 텍스트 변경
    document.getElementById('submitBtn').textContent = '수정하기';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    // 폼으로 스크롤
    document.querySelector('.admin-section').scrollIntoView({ behavior: 'smooth' });
}

// 매뉴얼 삭제 (모달 표시)
function deleteManual(manualId) {
    deleteTargetId = manualId;
    document.getElementById('deleteModal').classList.add('active');
}

// 삭제 확인
function confirmDelete() {
    if (!deleteTargetId) return;
    
    try {
        let manuals = getManuals();
        manuals = manuals.filter(m => m.id !== deleteTargetId);
        saveManuals(manuals);
        
        showNotification('매뉴얼이 삭제되었습니다.', 'success');
        closeDeleteModal();
        loadAdminManuals();
    } catch (error) {
        console.error('삭제 오류:', error);
        showNotification('삭제 중 오류가 발생했습니다.', 'error');
    }
}

// 삭제 모달 닫기
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deleteTargetId = null;
}

// 관리자 페이지네이션 렌더링
function renderAdminPagination(totalCount) {
    const pagination = document.getElementById('adminPagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(totalCount / limit) || 1;
    
    if (totalPages <= 1) return;
    
    // 이전 버튼
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '이전';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            loadAdminManuals();
        }
    };
    pagination.appendChild(prevBtn);
    
    // 페이지 번호 버튼
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn';
        pageBtn.textContent = i;
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.onclick = () => {
            currentPage = i;
            loadAdminManuals();
        };
        pagination.appendChild(pageBtn);
    }
    
    // 다음 버튼
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = '다음';
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadAdminManuals();
        }
    };
    pagination.appendChild(nextBtn);
}

// 알림 표시
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 16px 24px;
        background-color: ${type === 'success' ? '#DEF7EC' : '#FEE2E2'};
        color: ${type === 'success' ? '#047857' : '#DC2626'};
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// 전역 함수로 노출 (HTML onclick에서 사용)
window.editManual = editManual;
window.deleteManual = deleteManual;
