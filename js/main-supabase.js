// 시헌테크 - 사용자 페이지 JavaScript (Supabase 버전)

let currentPage = 1;
let currentCategory = '잉크젯 프린터';
let currentSearch = '';
const limit = 12;

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

// 공개 여부를 안정적으로 판별하는 함수
function isPublished(manual) {
    return manual.is_published === true ||
           manual.is_published === 'true' ||
           manual.is_published === 1 ||
           manual.is_published === '1';
}

// 매뉴얼 전체 데이터 가져오기 (Supabase)
async function getManuals() {
    try {
        console.log('Supabase에서 매뉴얼 로드 시작');
        
        const { data, error } = await supabase
            .from('manuals')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Supabase 오류:', error);
            return [];
        }
        
        console.log('로드된 매뉴얼:', data.length);
        return data || [];
        
    } catch (error) {
        console.error('매뉴얼 로드 실패:', error);
        return [];
    }
}

function handleSearch() {
    currentSearch = document.getElementById('searchInput').value.trim();
    currentPage = 1;
    loadManuals();
}

async function updateAllCounts() {
    const manuals = await getManuals();
    const published = manuals.filter(isPublished);
    
    document.getElementById('countInkjet').textContent = 
        published.filter(m => m.category === '잉크젯 프린터').length;
    
    document.getElementById('countLaser').textContent = 
        published.filter(m => m.category === '레이저 프린터').length;
    
    document.getElementById('countCleaner').textContent = 
        published.filter(m => m.category === '공기청정기').length;
}

async function loadManuals() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const manualList = document.getElementById('manualList');
    
    console.log('loadManuals 시작 - 카테고리:', currentCategory);
    
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    manualList.innerHTML = '';
    
    try {
        let manuals = await getManuals();
        console.log('전체 매뉴얼:', manuals.length);
        
        let filteredManuals = manuals.filter(manual => 
            isPublished(manual) && manual.category === currentCategory
        );
        console.log('공개된 매뉴얼 (카테고리 필터 후):', filteredManuals.length);
        
        if (currentSearch) {
            filteredManuals = filteredManuals.filter(manual => {
                const searchLower = currentSearch.toLowerCase();
                return (
                    manual.title.toLowerCase().includes(searchLower) ||
                    (manual.tags && manual.tags.toLowerCase().includes(searchLower)) ||
                    manual.content.toLowerCase().includes(searchLower)
                );
            });
            console.log('검색 필터 후:', filteredManuals.length);
        }
        
        filteredManuals.sort((a, b) => (b.views || 0) - (a.views || 0));
        
        loadingState.classList.add('hidden');
        
        if (filteredManuals.length === 0) {
            console.log('매뉴얼 없음 - 빈 상태 표시');
            emptyState.classList.remove('hidden');
        } else {
            const startIndex = (currentPage - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedManuals = filteredManuals.slice(startIndex, endIndex);
            
            console.log('렌더링할 매뉴얼:', paginatedManuals.length);
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
    const modalMedia = document.getElementById('modalMedia');
    
    const badgeClass = getCategoryBadgeClass(manual.category);
    
    modalTitle.textContent = manual.title;
    modalCategory.textContent = manual.category;
    modalCategory.className = `modal-badge ${badgeClass}`;
    modalViews.textContent = `조회 ${manual.views || 0}`;
    modalContent.textContent = manual.content;
    
    // 태그 렌더링
    const tags = manual.tags ? manual.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    modalTags.innerHTML = tags.map(tag => `<span class="modal-tag">${escapeHtml(tag)}</span>`).join('');
    
    // 미디어 렌더링 (이미지/영상)
    const mediaUrls = (manual.media_urls && manual.media_urls !== 'null')
        ? manual.media_urls.split(',').map(u => u.trim()).filter(u => u)
        : [];

    if (mediaUrls.length > 0) {
        const mediaHtml = mediaUrls.map(url => {
            // 동영상 확장자 판별
            const lower = url.toLowerCase();
            if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg') || lower.includes('youtube.com') || lower.includes('youtu.be')) {
                return `
                    <video controls class="modal-media-video" playsinline>
                        <source src="${url}" type="video/mp4">
                        동영상을 재생할 수 없습니다.
                    </video>
                `;
            }
            // 기본은 이미지로 처리
            return `
                <img src="${url}" alt="매뉴얼 이미지" class="modal-media-image" loading="lazy">
            `;
        }).join('');
        modalMedia.innerHTML = mediaHtml;
    } else {
        modalMedia.innerHTML = '';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    incrementViews(manual.id);
}

function closeModal() {
    const modal = document.getElementById('manualModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

async function incrementViews(manualId) {
    try {
        // 현재 조회수 가져오기
        const { data: manual, error: fetchError } = await supabase
            .from('manuals')
            .select('views')
            .eq('id', manualId)
            .single();
        
        if (fetchError) {
            console.error('조회수 조회 오류:', fetchError);
            return;
        }
        
        // 조회수 증가
        const newViews = (manual.views || 0) + 1;
        
        const { error: updateError } = await supabase
            .from('manuals')
            .update({ views: newViews })
            .eq('id', manualId);
        
        if (updateError) {
            console.error('조회수 업데이트 오류:', updateError);
            return;
        }
        
        // 페이지 새로고침
        setTimeout(() => {
            loadManuals();
        }, 500);
        
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
