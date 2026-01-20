// 시헌테크 - 관리자 페이지 JavaScript (Supabase 버전)

let currentPage = 1;
let currentCategory = 'all';
let editingManualId = null;
let deleteTargetId = null;
const limit = 10;

// 제조사 및 모델 데이터
const manufacturersData = {
    '잉크젯 프린터': {
        '캐논': ['GX 공통', 'GX5090시리즈', 'GX6090시리즈', 'GX7090시리즈'],
        'HP': ['HP 공통 (A4)', 'HP 공통 (A3)', 'OJ7720', 'OJ7740', 'OJ9730', 'OJ9120', 'OJ8710', 'OJ8210'],
        '앱손': ['앱손 공통', 'L6270']
    },
    '레이저 프린터': {
        '캐논': ['캐논 공통', 'C3725', 'C3826', 'C3926'],
        '삼성': ['삼성 공통', 'X3220', 'X4300'],
        '리코': ['리코 공통', 'C2010', 'C2510', 'C3510', 'IM2500', 'IM3000']
    },
    '공기청정기': {
        '웰리핏': ['SH-3025', 'SH-4025']
    }
};

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
    
    // 파일 선택 시 미리보기
    document.getElementById('mediaFiles').addEventListener('change', function(e) {
        const files = e.target.files;
        const mediaPreview = document.getElementById('mediaPreview');
        
        if (files.length > 0) {
            const previewHtml = Array.from(files).map(file => {
                const isVideo = file.type.startsWith('video/');
                const url = URL.createObjectURL(file);
                return `
                    <div style="position: relative; display: inline-block;">
                        ${isVideo 
                            ? `<video src="${url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;"></video>`
                            : `<img src="${url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">`
                        }
                        <small style="display: block; font-size: 10px; color: #666; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.name}</small>
                    </div>
                `;
            }).join('');
            
            // 기존 파일이 있으면 유지
            const existingPreview = mediaPreview.innerHTML;
            mediaPreview.innerHTML = existingPreview + previewHtml;
        }
    });
    
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

// 제조사 선택 옵션 업데이트
function updateManufacturerOptions() {
    const category = document.getElementById('category').value;
    const manufacturerSelect = document.getElementById('manufacturer');
    const modelSelect = document.getElementById('model');
    
    // 초기화
    manufacturerSelect.innerHTML = '<option value="">제조사 선택</option>';
    modelSelect.innerHTML = '<option value="">먼저 제조사를 선택하세요</option>';
    
    if (!category || !manufacturersData[category]) {
        manufacturerSelect.innerHTML = '<option value="">먼저 카테고리를 선택하세요</option>';
        return;
    }
    
    // 제조사 옵션 추가
    const manufacturers = Object.keys(manufacturersData[category]);
    manufacturers.forEach(mf => {
        const option = document.createElement('option');
        option.value = mf;
        option.textContent = mf;
        manufacturerSelect.appendChild(option);
    });
}

// 모델 선택 옵션 업데이트
function updateModelOptions() {
    const category = document.getElementById('category').value;
    const manufacturer = document.getElementById('manufacturer').value;
    const modelSelect = document.getElementById('model');
    
    // 초기화
    modelSelect.innerHTML = '<option value="">모델 선택</option>';
    
    if (!category || !manufacturer || !manufacturersData[category] || !manufacturersData[category][manufacturer]) {
        modelSelect.innerHTML = '<option value="">먼저 제조사를 선택하세요</option>';
        return;
    }
    
    // 모델 옵션 추가
    const models = manufacturersData[category][manufacturer];
    
    if (models.length === 0) {
        modelSelect.innerHTML = '<option value="">등록된 모델이 없습니다</option>';
        return;
    }
    
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
    });
}

// Supabase Storage에 파일 업로드
async function uploadMediaFiles(files) {
    console.log('업로드할 파일 목록:', files);
    
    if (!files || files.length === 0) {
        return [];
    }

    const uploadedUrls = [];

    for (const file of files) {
        try {
            console.log('[관리자] 파일 업로드 시작:', file.name);
            
            // 파일명 생성 (타임스탬프 + 랜덤 + 원본명)
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 15);
            const ext = file.name.split('.').pop();
            const fileName = `${timestamp}_${random}.${ext}`;
            
            // Supabase Storage에 업로드
            const { data, error } = await window.sb.storage
                .from('manual-media')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) {
                throw new Error(`파일 업로드 실패: ${error.message}`);
            }
            
            // Public URL 생성
            const { data: publicData } = window.sb.storage
                .from('manual-media')
                .getPublicUrl(fileName);
            
            if (publicData.publicUrl) {
                uploadedUrls.push(publicData.publicUrl);
                console.log('[관리자] 업로드 성공:', publicData.publicUrl);
                showNotification(`${file.name} 업로드 완료`, 'success');
            }
            
        } catch (error) {
            console.error('[관리자] 파일 업로드 오류:', file.name, error);
            showNotification(`파일 업로드 실패: ${file.name}`, 'error');
        }
    }

    return uploadedUrls;
}

// Supabase에서 매뉴얼 가져오기
async function getManuals() {
    try {
        console.log('[관리자] Supabase에서 매뉴얼 로드');
        
        const { data, error } = await window.sb
            .from('manuals')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('[관리자] Supabase 오류:', error);
            return [];
        }
        
        console.log('[관리자] 로드된 매뉴얼:', data.length);
        return data || [];
        
    } catch (error) {
        console.error('[관리자] 매뉴얼 로드 실패:', error);
        return [];
    }
}

// 폼 제출 처리
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '업로드 중...';
    
    try {
        // 1) 첨부 파일 업로드
        const mediaFilesInput = document.getElementById('mediaFiles');
        const files = mediaFilesInput.files;
        
        let uploadedUrls = [];
        if (files && files.length > 0) {
            console.log('[관리자] 파일 업로드 시작:', files.length, '개');
            uploadedUrls = await uploadMediaFiles(files);
            console.log('[관리자] 업로드 완료:', uploadedUrls);
        }
        
        // 2) 기존 URL과 병합 (수정 모드인 경우)
        const existingUrls = document.getElementById('existingMediaUrls').value;
        const existingUrlsArray = existingUrls ? existingUrls.split(',').map(u => u.trim()).filter(u => u) : [];
        
        // 3) 동영상 URL 추가
        const videoUrlsInput = document.getElementById('videoUrls');
        const videoUrls = videoUrlsInput && videoUrlsInput.value 
            ? videoUrlsInput.value.split(',').map(u => u.trim()).filter(u => u) 
            : [];
        
        const allMediaUrls = [...existingUrlsArray, ...uploadedUrls, ...videoUrls];
        
        submitBtn.textContent = '저장 중...';
        
        // 4) 폼 데이터 구성
        const isPublishedCheckbox = document.getElementById('isPublished');
        const formData = {
            title: document.getElementById('title').value.trim(),
            category: document.getElementById('category').value,
            manufacturer: document.getElementById('manufacturer').value,
            model: document.getElementById('model').value,
            content: document.getElementById('content').value.trim(),
            tags: document.getElementById('tags').value.trim(),
            media_urls: allMediaUrls.length > 0 ? allMediaUrls.join(',') : '',
            is_published: isPublishedCheckbox ? isPublishedCheckbox.checked : true,
            views: editingManualId ? undefined : 0  // 수정 시에는 views 유지
        };
        
        console.log('[관리자] 저장할 데이터:', formData);
        
        let result, error;
        
        if (editingManualId) {
            // 수정
            console.log('[관리자] UPDATE:', editingManualId);
            ({ data: result, error } = await window.sb
                .from('manuals')
                .update(formData)
                .eq('id', editingManualId)
                .select()
                .single());
        } else {
            // 신규 등록
            console.log('[관리자] INSERT');
            ({ data: result, error } = await window.sb
                .from('manuals')
                .insert([formData])
                .select()
                .single());
        }
        
        if (error) {
            throw new Error(error.message);
        }
        
        console.log('[관리자] 저장 성공:', result);
        showNotification(editingManualId ? '매뉴얼이 수정되었습니다.' : '매뉴얼이 등록되었습니다.', 'success');
        resetForm();
        loadAdminManuals();
        
    } catch (error) {
        console.error('[관리자] 폼 제출 오류:', error);
        showNotification('오류가 발생했습니다: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// 미디어 파일 삭제
function removeMedia(index) {
    const existingUrlsInput = document.getElementById('existingMediaUrls');
    const urls = existingUrlsInput.value.split(',').map(u => u.trim()).filter(u => u);
    urls.splice(index, 1);
    existingUrlsInput.value = urls.join(',');
    
    // 미리보기 다시 렌더링
    const mediaPreview = document.getElementById('mediaPreview');
    mediaPreview.innerHTML = urls.map((url, i) => {
        const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg)$/);
        return `
            <div style="position: relative; display: inline-block;">
                ${isVideo 
                    ? `<video src="${url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;"></video>`
                    : `<img src="${url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">`
                }
                <span style="position: absolute; top: -5px; right: -5px; background: #f44; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer;" onclick="removeMedia(${i})">×</span>
            </div>
        `;
    }).join('');
}

// 폼 리셋
function resetForm() {
    document.getElementById('manualForm').reset();
    document.getElementById('manualId').value = '';
    document.getElementById('existingMediaUrls').value = '';
    document.getElementById('mediaPreview').innerHTML = '';
    
    const videoUrlsInput = document.getElementById('videoUrls');
    if (videoUrlsInput) {
        videoUrlsInput.value = '';
    }
    
    // 제조사/모델 선택 초기화
    document.getElementById('manufacturer').innerHTML = '<option value="">먼저 카테고리를 선택하세요</option>';
    document.getElementById('model').innerHTML = '<option value="">먼저 제조사를 선택하세요</option>';
    
    editingManualId = null;
    
    document.getElementById('submitBtn').textContent = '등록하기';
    document.getElementById('cancelBtn').style.display = 'none';
    
    // 스크롤을 폼 상단으로
    document.querySelector('.admin-section').scrollIntoView({ behavior: 'smooth' });
}

// 관리자 매뉴얼 리스트 로드
async function loadAdminManuals() {
    const loadingState = document.getElementById('adminLoadingState');
    const emptyState = document.getElementById('adminEmptyState');
    const manualList = document.getElementById('adminManualList');
    
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    manualList.innerHTML = '';
    
    try {
        let manuals = await getManuals();
        
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
        console.error('[관리자] 매뉴얼 로드 실패:', error);
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
    const isPublished = manual.is_published === true || manual.is_published === 'true' || manual.is_published === 1 || manual.is_published === '1';
    const statusClass = isPublished ? 'status-published' : 'status-draft';
    const statusText = isPublished ? '공개' : '비공개';
    
    row.innerHTML = `
        <td class="table-title">${escapeHtml(manual.title)}</td>
        <td>${escapeHtml(manual.category)}</td>
        <td>${escapeHtml(manual.manufacturer || '-')}</td>
        <td>${escapeHtml(manual.model || '-')}</td>
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
async function editManual(manualId) {
    try {
        console.log('[관리자] 수정 요청:', manualId);
        
        const { data: manual, error } = await window.sb
            .from('manuals')
            .select('*')
            .eq('id', manualId)
            .single();
        
        if (error || !manual) {
            showNotification('매뉴얼을 찾을 수 없습니다.', 'error');
            return;
        }
        
        // 폼에 데이터 채우기
        document.getElementById('manualId').value = manual.id;
        document.getElementById('title').value = manual.title;
        document.getElementById('category').value = manual.category;
        
        // 제조사 및 모델 업데이트
        updateManufacturerOptions();
        if (manual.manufacturer) {
            document.getElementById('manufacturer').value = manual.manufacturer;
            updateModelOptions();
            if (manual.model) {
                document.getElementById('model').value = manual.model;
            }
        }
        
        document.getElementById('content').value = manual.content;
        document.getElementById('tags').value = manual.tags || '';
        document.getElementById('isPublished').checked = manual.is_published === true || manual.is_published === 'true' || manual.is_published === 1 || manual.is_published === '1';
        
        // 기존 미디어 URL 처리
        const existingMediaUrls = (manual.media_urls && manual.media_urls !== 'null') ? manual.media_urls : '';
        document.getElementById('existingMediaUrls').value = existingMediaUrls;
        
        // 기존 첨부 파일 미리보기 표시
        const mediaPreview = document.getElementById('mediaPreview');
        if (manual.media_urls && manual.media_urls !== 'null') {
            const urls = manual.media_urls.split(',').map(u => u.trim()).filter(u => u);
            mediaPreview.innerHTML = urls.map((url, index) => {
                const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg)$/);
                return `
                    <div style="position: relative; display: inline-block;">
                        ${isVideo 
                            ? `<video src="${url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;"></video>`
                            : `<img src="${url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">`
                        }
                        <span style="position: absolute; top: -5px; right: -5px; background: #f44; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer;" onclick="removeMedia(${index})">×</span>
                    </div>
                `;
            }).join('');
        } else {
            mediaPreview.innerHTML = '';
        }
        
        editingManualId = manual.id;
        
        // 버튼 텍스트 변경
        document.getElementById('submitBtn').textContent = '수정하기';
        document.getElementById('cancelBtn').style.display = 'inline-block';
        
        // 폼으로 스크롤
        document.querySelector('.admin-section').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('[관리자] 수정 로드 오류:', error);
        showNotification('매뉴얼을 불러올 수 없습니다.', 'error');
    }
}

// 매뉴얼 삭제 (모달 표시)
function deleteManual(manualId) {
    deleteTargetId = manualId;
    document.getElementById('deleteModal').classList.add('active');
}

// 삭제 확인
async function confirmDelete() {
    if (!deleteTargetId) return;
    
    try {
        console.log('[관리자] DELETE:', deleteTargetId);
        
        const { error } = await window.sb
            .from('manuals')
            .delete()
            .eq('id', deleteTargetId);
        
        if (error) {
            throw new Error(error.message);
        }
        
        showNotification('매뉴얼이 삭제되었습니다.', 'success');
        closeDeleteModal();
        loadAdminManuals();
        
    } catch (error) {
        console.error('[관리자] 삭제 오류:', error);
        showNotification('삭제 중 오류가 발생했습니다: ' + error.message, 'error');
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
    // 기존 알림 제거
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        padding: 20px 32px;
        background-color: ${type === 'success' ? '#10B981' : '#EF4444'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 600;
        font-size: 16px;
        min-width: 300px;
        text-align: center;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    
    // 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        @keyframes slideUp {
            from {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            to {
                transform: translateX(-50%) translateY(-20px);
                opacity: 0;
            }
        }
    `;
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
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
window.removeMedia = removeMedia;
