// 시헌테크 - 사용자 페이지 JavaScript

let currentPage = 1;
let currentCategory = 'all';
let currentSearch = '';
const limit = 9;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 앱 초기화
function initializeApp() {
    // 이벤트 리스너 등록
    setupEventListeners();
    
    // 매뉴얼 리스트 로드
    loadManuals();
    
    // 전체 매뉴얼 수 업데이트
    updateTotalCount();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 검색 입력 엔터키
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // 검색 입력 변경 시
    document.getElementById('searchInput').addEventListener('input', function() {
        handleSearch();
    });
    
    // 카테고리 필터 버튼들 (chip)
    document.querySelectorAll('.chip').forEach(btn => {
        btn.addEventListener('click', function() {
            // 활성 클래스 변경
            document.querySelectorAll('.chip').forEach(b => b.classList.remove('is-active'));
            this.classList.add('is-active');
            
            // 카테고리 필터링
            currentCategory = this.dataset.category;
            currentPage = 1;
            loadManuals();
        });
    });
    
    // 모달 닫기
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);
}

// 검색 처리
function handleSearch() {
    currentSearch = document.getElementById('searchInput').value.trim();
    currentPage = 1;
    loadManuals();
}

// 전체 매뉴얼 수 업데이트
async function updateTotalCount() {
    try {
        const response = await fetch('tables/manuals?page=1&limit=1000');
        const result = await response.json();
        const publishedCount = result.data.filter(m => m.is_published).length;
        
        document.getElementById('totalManuals').textContent = `등록된 매뉴얼 ${publishedCount}건`;
        document.getElementById('manualCount').textContent = `등록된 매뉴얼 ${publishedCount}건`;
    } catch (error) {
        console.error('전체 수 로드 실패:', error);
    }
}

// 매뉴얼 리스트 로드
async function loadManuals() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const manualList = document.getElementById('manualList');
    
    // 로딩 상태 표시
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    manualList.innerHTML = '';
    
    try {
        // API 호출 (전체 데이터 가져오기)
        let url = 'tables/manuals?page=1&limit=1000&sort=-views';
        
        const response = await fetch(url);
        const result = await response.json();
        
        // 로딩 상태 숨김
        loadingState.classList.add('hidden');
        
        // 공개된 매뉴얼만 필터링
        let filteredManuals = result.data.filter(manual => manual.is_published);
        
        // 카테고리 필터링 (클라이언트 측)
        if (currentCategory !== 'all') {
            filteredManuals = filteredManuals.filter(manual => 
                manual.category === currentCategory
            );
        }
        
        // 검색어 필터링 (클라이언트 측)
        if (currentSearch) {
            filteredManuals = filteredManuals.filter(manual => {
                const searchLower = currentSearch.toLowerCase();
                return (
                    manual.title.toLowerCase().includes(searchLower) ||
                    (manual.tags && manual.tags.toLowerCase().includes(searchLower)) ||
                    manual.content.toLowerCase().includes(searchLower)
                );
            });
        }
        
        if (filteredManuals.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            // 페이지네이션 적용
            const startIndex = (currentPage - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedManuals = filteredManuals.slice(startIndex, endIndex);
            
            renderManuals(paginatedManuals);
            renderPagination(filteredManuals.length);
        }
        
    } catch (error) {
        console.error('매뉴얼 로드 실패:', error);
        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }
}

// 매뉴얼 카드 렌더링
function renderManuals(manuals) {
    const manualList = document.getElementById('manualList');
    manualList.innerHTML = '';
    
    manuals.forEach(manual => {
        const card = createManualCard(manual);
        manualList.appendChild(card);
    });
}

// 매뉴얼 카드 생성
function createManualCard(manual) {
    const card = document.createElement('article');
    card.className = 'card';
    card.onclick = () => openManualModal(manual);
    
    // 미리보기 텍스트 (120자 제한)
    const preview = manual.content.substring(0, 120) + (manual.content.length > 120 ? '...' : '');
    
    // 태그 파싱
    const tags = manual.tags ? manual.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // 날짜 포맷
    const createdDate = new Date(manual.created_at || Date.now()).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    card.innerHTML = `
        <div>
            <div class="card-title-row">
                <h2 class="card-title">${escapeHtml(manual.title)}</h2>
                <span class="card-tag">${escapeHtml(manual.category)}</span>
            </div>
            <p class="card-desc">${escapeHtml(preview)}</p>
        </div>
        <div class="card-meta">
            <span class="card-meta-item">최근 수정: ${createdDate}</span>
            <span class="card-meta-item">조회 ${manual.views || 0}회</span>
        </div>
    `;
    
    return card;
}

// 매뉴얼 모달 열기
async function openManualModal(manual) {
    const modal = document.getElementById('manualModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalViews = document.getElementById('modalViews');
    const modalContent = document.getElementById('modalContent');
    const modalTags = document.getElementById('modalTags');
    
    // 모달 내용 설정
    modalTitle.textContent = manual.title;
    modalCategory.textContent = manual.category;
    modalViews.textContent = `조회 ${manual.views || 0}회`;
    modalContent.textContent = manual.content;
    
    // 태그 렌더링
    const tags = manual.tags ? manual.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    modalTags.innerHTML = tags.map(tag => `<span class="modal-tag">${escapeHtml(tag)}</span>`).join('');
    
    // 모달 표시
    modal.classList.add('active');
    
    // 조회수 증가
    await incrementViews(manual.id, manual.views || 0);
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('manualModal');
    modal.classList.remove('active');
}

// 조회수 증가
async function incrementViews(manualId, currentViews) {
    try {
        await fetch(`tables/manuals/${manualId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                views: currentViews + 1
            })
        });
        
        // 조회수 업데이트 후 리스트 새로고침
        setTimeout(() => {
            loadManuals();
        }, 500);
    } catch (error) {
        console.error('조회수 업데이트 실패:', error);
    }
}

// 페이지네이션 렌더링
function renderPagination(totalCount) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(totalCount / limit) || 1;
    
    // 페이지가 1개면 페이지네이션 숨김
    if (totalPages <= 1) {
        return;
    }
    
    // 이전 버튼
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '이전';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            loadManuals();
            scrollToManuals();
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
            loadManuals();
            scrollToManuals();
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
            loadManuals();
            scrollToManuals();
        }
    };
    pagination.appendChild(nextBtn);
}

// 매뉴얼 섹션으로 스크롤
function scrollToManuals() {
    const section = document.querySelector('.section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

// 전역 함수로 노출
window.scrollToManuals = scrollToManuals;
