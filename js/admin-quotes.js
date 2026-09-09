// 관리자 - 견적문의 관리

let currentQuotePage = 1;
let currentQuoteStatus = 'all';
let currentQuoteId = null;
const quoteLimit = 10;

// 탭 전환
function switchTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // 모든 탭 컨텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tabName === 'manuals') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('manualsTab').classList.add('active');
    } else if (tabName === 'quotes') {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('quotesTab').classList.add('active');
        loadQuotes(); // 견적문의 탭 열 때 데이터 로드
    } else if (tabName === 'models') {
        document.querySelector('.tab-btn:nth-child(3)').classList.add('active');
        document.getElementById('modelsTab').classList.add('active');
        if (typeof loadEquipmentModelAdmin === 'function') loadEquipmentModelAdmin();
    }
}

// 견적문의 목록 로드
async function loadQuotes() {
    const loadingState = document.getElementById('quoteLoadingState');
    const emptyState = document.getElementById('quoteEmptyState');
    const quoteList = document.getElementById('quoteList');
    const tableWrapper = document.querySelector('#quotesTab .admin-table-wrapper');
    
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    if (tableWrapper) tableWrapper.style.display = 'none';
    
    try {
        // RESTful API로 견적문의 데이터 가져오기
        const response = await fetch(`tables/quotes?sort=-created_at&limit=100`);
        
        if (!response.ok) {
            throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        
        const result = await response.json();
        let quotes = result.data || [];
        
        // 상태 필터링
        if (currentQuoteStatus !== 'all') {
            quotes = quotes.filter(quote => quote.status === currentQuoteStatus);
        }
        
        loadingState.style.display = 'none';
        
        if (quotes.length === 0) {
            emptyState.style.display = 'block';
        } else {
            // 페이지네이션 적용
            const startIndex = (currentQuotePage - 1) * quoteLimit;
            const endIndex = startIndex + quoteLimit;
            const paginatedQuotes = quotes.slice(startIndex, endIndex);
            
            renderQuotes(paginatedQuotes);
            renderQuotePagination(quotes.length);
            if (tableWrapper) tableWrapper.style.display = 'block';
        }
        
    } catch (error) {
        console.error('[관리자] 견적문의 로드 실패:', error);
        loadingState.innerHTML = '데이터를 불러오는데 실패했습니다.';
    }
}

// 견적문의 목록 렌더링
function renderQuotes(quotes) {
    const quoteList = document.getElementById('quoteList');
    quoteList.innerHTML = '';
    
    quotes.forEach(quote => {
        const row = document.createElement('tr');
        
        const createdDate = new Date(quote.created_at).toLocaleDateString('ko-KR');
        const statusClass = quote.status === '답변완료' ? 'status-completed' : 'status-waiting';
        const statusText = quote.status || '대기중';
        
        row.innerHTML = `
            <td class="table-title">${escapeHtml(quote.title)}</td>
            <td>${escapeHtml(quote.author_name)}</td>
            <td>${escapeHtml(quote.contact)}</td>
            <td>${escapeHtml(quote.customer_name || '-')}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${createdDate}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-primary btn-sm" onclick="viewQuoteDetail('${quote.id}')">보기/답변</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteQuote('${quote.id}')">삭제</button>
                </div>
            </td>
        `;
        
        quoteList.appendChild(row);
    });
}

// 견적문의 상세보기
async function viewQuoteDetail(quoteId) {
    try {
        const response = await fetch(`tables/quotes/${quoteId}`);
        
        if (!response.ok) {
            throw new Error('견적문의를 찾을 수 없습니다.');
        }
        
        const quote = await response.json();
        currentQuoteId = quoteId;
        
        // 모달에 데이터 표시
        document.getElementById('quoteDetailTitle').textContent = quote.title;
        document.getElementById('quoteDetailAuthor').textContent = quote.author_name;
        document.getElementById('quoteDetailContact').textContent = quote.contact;
        
        if (quote.customer_name) {
            document.getElementById('quoteDetailCompanyRow').style.display = 'flex';
            document.getElementById('quoteDetailCompany').textContent = quote.customer_name;
        } else {
            document.getElementById('quoteDetailCompanyRow').style.display = 'none';
        }
        
        const date = new Date(quote.created_at).toLocaleString('ko-KR');
        document.getElementById('quoteDetailDate').textContent = date;
        
        const statusEl = document.getElementById('quoteDetailStatus');
        const statusClass = quote.status === '답변완료' ? 'status-completed' : 'status-waiting';
        statusEl.className = `status-badge ${statusClass}`;
        statusEl.textContent = quote.status || '대기중';
        
        document.getElementById('quoteDetailContent').textContent = quote.content;
        document.getElementById('adminReply').value = quote.admin_reply || '';
        
        // 고객 첨부파일 표시
        const quoteAttachmentSection = document.getElementById('quoteAttachmentSection');
        const quoteAttachmentList = document.getElementById('quoteAttachmentList');
        if (quote.attachments && quote.attachments.trim()) {
            const urls = quote.attachments.split(',').map(u => u.trim()).filter(u => u);
            if (urls.length > 0) {
                quoteAttachmentSection.style.display = 'block';
                quoteAttachmentList.innerHTML = urls.map((url, index) => {
                    const fileName = url.split('/').pop().split('_').slice(2).join('_') || `첨부파일${index + 1}`;
                    return `
                        <a href="${url}" target="_blank" download style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--color-primary-soft); border-radius: 8px; color: var(--color-primary); text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.2s;">
                            <span style="font-size: 18px;">📎</span>
                            <span>${escapeHtml(fileName)}</span>
                        </a>
                    `;
                }).join('');
            } else {
                quoteAttachmentSection.style.display = 'none';
            }
        } else {
            quoteAttachmentSection.style.display = 'none';
        }

        // 기존 관리자 첨부파일 표시
        const existingAdminAttachments = document.getElementById('existingAdminAttachments');
        if (quote.admin_attachments && quote.admin_attachments.trim()) {
            const urls = quote.admin_attachments.split(',').map(u => u.trim()).filter(u => u);
            if (urls.length > 0) {
                existingAdminAttachments.innerHTML = `
                    <strong style="display: block; margin-bottom: 8px; font-size: 13px;">기존 첨부파일:</strong>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${urls.map((url, index) => {
                            const fileName = url.split('/').pop().split('_').slice(2).join('_') || `첨부파일${index + 1}`;
                            return `
                                <a href="${url}" target="_blank" download style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--color-gray-100); border-radius: 8px; color: var(--color-text-main); text-decoration: none; font-size: 14px; font-weight: 500;">
                                    <span style="font-size: 18px;">📎</span>
                                    <span>${escapeHtml(fileName)}</span>
                                </a>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                existingAdminAttachments.innerHTML = '';
            }
        } else {
            existingAdminAttachments.innerHTML = '';
        }

        // 파일 입력 초기화
        document.getElementById('adminAttachments').value = '';
        document.getElementById('adminFilePreview').innerHTML = '';
        
        // 모달 열기
        document.getElementById('quoteModal').classList.add('active');
        
    } catch (error) {
        console.error('[관리자] 견적문의 로드 오류:', error);
        alert('견적문의를 불러올 수 없습니다: ' + error.message);
    }
}

// 모달 닫기
function closeQuoteModal() {
    document.getElementById('quoteModal').classList.remove('active');
    currentQuoteId = null;
}

// 파일 업로드 (Supabase Storage)
async function uploadAdminFiles(files) {
    const uploadedUrls = [];
    
    for (const file of files) {
        try {
            // 파일 크기 체크 (10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name}은(는) 10MB를 초과하여 업로드할 수 없습니다.`);
                continue;
            }

            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 15);
            const ext = file.name.split('.').pop();
            const fileName = `admin_quote_${timestamp}_${random}.${ext}`;
            
            const { data, error } = await supabase.storage
                .from('manual-media')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) {
                throw new Error(`파일 업로드 실패: ${error.message}`);
            }
            
            const { data: publicData } = supabase.storage
                .from('manual-media')
                .getPublicUrl(fileName);
            
            if (publicData.publicUrl) {
                uploadedUrls.push(publicData.publicUrl);
            }
            
        } catch (error) {
            console.error('파일 업로드 오류:', file.name, error);
            alert(`${file.name} 업로드 실패: ${error.message}`);
        }
    }
    
    return uploadedUrls;
}

// 답변 저장
async function saveQuoteReply() {
    if (!currentQuoteId) {
        alert('오류가 발생했습니다.');
        return;
    }
    
    const adminReply = document.getElementById('adminReply').value.trim();
    
    if (!adminReply) {
        alert('답변 내용을 입력하세요.');
        return;
    }
    
    try {
        // 파일 업로드
        const fileInput = document.getElementById('adminAttachments');
        const files = Array.from(fileInput.files);
        
        let newAttachmentUrls = [];
        if (files.length > 0) {
            if (files.length > 5) {
                alert('파일은 최대 5개까지 첨부 가능합니다.');
                return;
            }
            
            newAttachmentUrls = await uploadAdminFiles(files);
        }

        // 기존 첨부파일 가져오기
        const response = await fetch(`tables/quotes/${currentQuoteId}`);
        if (!response.ok) {
            console.error('[관리자] 견적문의 조회 실패:', response.status, response.statusText);
            throw new Error(`견적문의를 불러올 수 없습니다. (Status: ${response.status})`);
        }
        const currentQuote = await response.json();
        console.log('[관리자] 현재 견적문의 데이터:', currentQuote);
        
        const existingUrls = currentQuote.admin_attachments 
            ? currentQuote.admin_attachments.split(',').map(u => u.trim()).filter(u => u)
            : [];

        // 기존 + 새 파일 병합
        const allAttachments = [...existingUrls, ...newAttachmentUrls];
        
        // 업데이트할 데이터 구성
        const updateData = {
            admin_reply: adminReply,
            status: '답변완료'
        };
        
        // 첨부파일이 있는 경우에만 추가
        if (allAttachments.length > 0) {
            updateData.admin_attachments = allAttachments.join(',');
        }
        
        console.log('[관리자] 업데이트 데이터:', updateData);
        
        // 답변 저장 (상태도 답변완료로 변경)
        // PUT 메소드는 전체 데이터를 전송해야 하므로 기존 데이터와 병합
        const fullUpdateData = {
            ...currentQuote,
            admin_reply: adminReply,
            status: '답변완료'
        };
        
        if (allAttachments.length > 0) {
            fullUpdateData.admin_attachments = allAttachments.join(',');
        }
        
        console.log('[관리자] 전체 업데이트 데이터:', fullUpdateData);
        
        const updateResponse = await fetch(`tables/quotes/${currentQuoteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fullUpdateData)
        });
        
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('[관리자] 답변 저장 실패 상세:', {
                status: updateResponse.status,
                statusText: updateResponse.statusText,
                body: errorText
            });
            throw new Error(`답변 저장에 실패했습니다. (Status: ${updateResponse.status}) ${errorText}`);
        }
        
        const result = await updateResponse.json();
        console.log('[관리자] 답변 저장 성공:', result);
        
        alert('답변이 저장되었습니다.');
        closeQuoteModal();
        loadQuotes(); // 목록 새로고침
        
    } catch (error) {
        console.error('[관리자] 답변 저장 오류:', error);
        alert('오류가 발생했습니다: ' + error.message);
    }
}

// 페이지네이션 렌더링
function renderQuotePagination(totalCount) {
    const pagination = document.getElementById('quotePagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(totalCount / quoteLimit) || 1;
    
    if (totalPages <= 1) return;
    
    // 이전 버튼
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '이전';
    prevBtn.disabled = currentQuotePage === 1;
    prevBtn.onclick = () => {
        if (currentQuotePage > 1) {
            currentQuotePage--;
            loadQuotes();
        }
    };
    pagination.appendChild(prevBtn);
    
    // 페이지 번호 버튼
    const startPage = Math.max(1, currentQuotePage - 2);
    const endPage = Math.min(totalPages, currentQuotePage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn';
        pageBtn.textContent = i;
        if (i === currentQuotePage) {
            pageBtn.classList.add('active');
        }
        pageBtn.onclick = () => {
            currentQuotePage = i;
            loadQuotes();
        };
        pagination.appendChild(pageBtn);
    }
    
    // 다음 버튼
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = '다음';
    nextBtn.disabled = currentQuotePage >= totalPages;
    nextBtn.onclick = () => {
        if (currentQuotePage < totalPages) {
            currentQuotePage++;
            loadQuotes();
        }
    };
    pagination.appendChild(nextBtn);
}

// HTML 이스케이프
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

// 상태 필터 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    const quoteStatusFilter = document.getElementById('quoteStatusFilter');
    if (quoteStatusFilter) {
        quoteStatusFilter.addEventListener('change', function() {
            currentQuoteStatus = this.value;
            currentQuotePage = 1;
            loadQuotes();
        });
    }

    // 관리자 파일 미리보기
    const adminAttachmentsInput = document.getElementById('adminAttachments');
    if (adminAttachmentsInput) {
        adminAttachmentsInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            const preview = document.getElementById('adminFilePreview');
            
            preview.innerHTML = files.map(file => {
                const size = (file.size / 1024).toFixed(1);
                return `
                    <div style="padding: 8px 12px; background: var(--color-primary-soft); border-radius: 8px; font-size: 13px; color: var(--color-text-main);">
                        📎 ${file.name} (${size}KB)
                    </div>
                `;
            }).join('');
        });
    }
});

// 견적문의 삭제
let deleteQuoteId = null;

function deleteQuote(quoteId) {
    deleteQuoteId = quoteId;
    const deleteModal = document.getElementById('deleteQuoteModal');
    if (deleteModal) {
        deleteModal.classList.add('active');
    }
}

// 삭제 확인
async function confirmDeleteQuote() {
    if (!deleteQuoteId) return;
    
    try {
        const response = await fetch(`tables/quotes/${deleteQuoteId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('삭제에 실패했습니다.');
        }
        
        alert('견적문의가 삭제되었습니다.');
        closeDeleteQuoteModal();
        loadQuotes(); // 목록 새로고침
        
    } catch (error) {
        console.error('[관리자] 견적문의 삭제 오류:', error);
        alert('오류가 발생했습니다: ' + error.message);
    }
}

// 삭제 모달 닫기
function closeDeleteQuoteModal() {
    const deleteModal = document.getElementById('deleteQuoteModal');
    if (deleteModal) {
        deleteModal.classList.remove('active');
    }
    deleteQuoteId = null;
}

// 전역 함수로 노출
window.switchTab = switchTab;
window.viewQuoteDetail = viewQuoteDetail;
window.closeQuoteModal = closeQuoteModal;
window.saveQuoteReply = saveQuoteReply;
window.deleteQuote = deleteQuote;
window.confirmDeleteQuote = confirmDeleteQuote;
window.closeDeleteQuoteModal = closeDeleteQuoteModal;
