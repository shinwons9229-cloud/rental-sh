// 시헌테크 - 사용자 페이지 JavaScript

let currentPage = 1;
let currentCategory = '잉크젯 프린터';
let currentSearch = '';
const limit = 12;

const STORAGE_KEY = 'sihyuntech_manuals';

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadManuals();
    updateAllCounts();
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    document.getElementById('searchInput').addEventListener('input', function() {
        handleSearch();
    });
    
    document.getElementById('closeModal').addEventListener('click', closeModal);
}

function getManuals() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveManuals(manuals) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(manuals));
}

function handleSearch() {
    currentSearch = document.getElementById('searchInput').value.trim();
    currentPage = 1;
    loadManuals();
}

function updateAllCounts() {
    const manuals = getManuals();
    const published = manuals.filter(m => m.is_published);
    
    document.getElementById('countInkjet').textContent = 
        published.filter(m => m.category === '잉크젯 프린터').length;
    
    document.getElementById('countLaser').textContent = 
        published.filter(m => m.category === '레이저 프린터').length;
    
    document.getElementById('countCleaner').textContent = 
        published.filter(m => m.category === '공기청정기').length;
}

function loadManuals() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const manualList = document.getElementById('manualList');
    
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    manualList.innerHTML = '';
    
    try {
        let manuals = getManuals();
        let filteredManuals = manuals.filter(manual => 
            manual.is_published && manual.category === currentCategory
        );
        
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
        
        filteredManuals.sort((a, b) => (b.views || 0) - (a.views || 0));
        
        loadingState.classList.add('hidden');
        
        if (filteredManuals.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            const startIndex = (currentPage - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedManuals = filteredManuals.slice(startIndex, endIndex);
            
            renderManuals(paginatedManuals);
            renderPagination(filteredManuals.length);
        }
        
        updateAllCounts();
        
    } catch (error) {
        console.error('매뉴얼 로드 실패:', error);
        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }
}

function renderManuals(manuals) {
    const manualList = document.getElementById('manualList');
    manualList.innerHTML = '';
    
    manuals.forEach(manual => {
        const card = createManualCard(manual);
        manualList.appendChild(card);
    });
}

function getCategoryBadgeClass(category) {
    const map = {
        '잉크젯 프린터': 'badge-inkjet',
        '레이저 프린터': 'badge-laser',
        '공기청정기': 'badge-cleaner'
    };
    return map[category] || 'badge-inkjet';
}

function createManualCard(manual) {
    const card = document.createElement('article');
    card.className = 'manual-card';
    card.onclick = () => openManualModal(manual);
    
    const preview = manual.content.substring(0, 80) + (manual.content.length > 80 ? '...' : '');
    const createdDate = new Date(manual.created_at || Date.now()).toLocaleDateString('ko-KR');
    const badgeClass = getCategoryBadgeClass(manual.category);
    
    card.innerHTML = `
        <div class="manual-header">
            <h3 class="manual-title">${escapeHtml(manual.title)}</h3>
            <span class="manual-badge ${badgeClass}">${escapeHtml(manual.category)}</span>
        </div>
        <p class="manual-desc">${escapeHtml(preview)}</p>
        <div class="manual-footer">
            <span>${createdDate}</span>
            <span>조회 ${manual.views || 0}</span>
        </div>
    `;
    
    return card;
}

function openManualModal(manual) {
    const modal = document.getElementById('manualModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalViews = document.getElementById('modalViews');
    const modalContent = document.getElementById('modalContent');
    const modalTags = document.getElementById('modalTags');
    
    const badgeClass = getCategoryBadgeClass(manual.category);
    
    modalTitle.textContent = manual.title;
    modalCategory.textContent = manual.category;
    modalCategory.className = `modal-badge ${badgeClass}`;
    modalViews.textContent = `조회 ${manual.views || 0}`;
    modalContent.textContent = manual.content;
    
    const tags = manual.tags ? manual.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    modalTags.innerHTML = tags.map(tag => `<span class="modal-tag">${escapeHtml(tag)}</span>`).join('');
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    incrementViews(manual.id);
}

function closeModal() {
    const modal = document.getElementById('manualModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function incrementViews(manualId) {
    try {
        let manuals = getManuals();
        const index = manuals.findIndex(m => m.id === manualId);
        
        if (index !== -1) {
            manuals[index].views = (manuals[index].views || 0) + 1;
            saveManuals(manuals);
            
            setTimeout(() => {
                loadManuals();
            }, 500);
        }
    } catch (error) {
        console.error('조회수 업데이트 실패:', error);
    }
}

function renderPagination(totalCount) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(totalCount / limit) || 1;
    
    if (totalPages <= 1) {
        return;
    }
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '이전';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            loadManuals();
            scrollToTop();
        }
    };
    pagination.appendChild(prevBtn);
    
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
            scrollToTop();
        };
        pagination.appendChild(pageBtn);
    }
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = '다음';
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadManuals();
            scrollToTop();
        }
    };
    pagination.appendChild(nextBtn);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

window.currentCategory = '잉크젯 프린터';
window.currentPage = 1;
window.loadManuals = loadManuals;
window.closeModal = closeModal;
