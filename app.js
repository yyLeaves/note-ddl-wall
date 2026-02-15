// =========================================
// State
// =========================================
let items = JSON.parse(localStorage.getItem('ddlItems')) || [];
let currentFilter = 'all';
let currentLang = localStorage.getItem('language') || 'zh';
let editingItemId = null;
let isAdding = false;
let draggedNote = null;
let dragOffset = { x: 0, y: 0 };
let isSorted = false;
let maxZIndex = items.length > 0 ? Math.max(...items.map(i => i.zIndex || 10)) : 10;

// =========================================
// Translations
// =========================================
const translations = {
    zh: {
        mainTitle: '📌 我的DDL墙 📌',
        subtitle: '直接在墙上记录你的灵感与期限',
        langBtn: 'English',
        placeholderTitle: '标题...',
        placeholderDesc: '添加描述...',
        btnSave: '确认',
        btnCancel: '取消',
        btnEdit: '编辑',
        btnDelete: '删除',
        typeDdl: 'DDL',
        typeNote: '便签',
        expired: '⏰ 已过期',
        daysLeft: '还有 {0} 天',
        hoursLeft: '⚠️ {0} 天 {1} 小时',
        minutesLeft: '🔥 {0} 小时 {1} 分钟',
        urgentMinutes: '🔥🔥 还有 {0} 分！',
        emptyTitle: '墙上还空空如也',
        emptyText: '点击右下角按钮添加第一个便签吧！',
        priorityHigh: '紧急', priorityMedium: '一般', priorityLow: '不急',
        sortBtn: '整理', placeholderTag: '添加标签, 回车确认',
        icsImport: '导入ICS', icsNoEvents: '未找到日历事件',
        icsImported: '成功导入 {0} 个事件', recurring: '每周重复',
        clearExpired: '清除已过期', clearedCount: '已清除 {0} 个过期项', clearedNone: '没有过期项',
        repeatWeekly: '每周重复',
    },
    en: {
        mainTitle: '📌 My DDL Wall 📌',
        subtitle: 'Pin notes and deadlines directly on the wall',
        langBtn: '中文',
        placeholderTitle: 'Title...',
        placeholderDesc: 'Details...',
        btnSave: 'Save',
        btnCancel: 'Cancel',
        btnEdit: 'Edit',
        btnDelete: 'Delete',
        typeDdl: 'DDL',
        typeNote: 'Note',
        expired: '⏰ Expired',
        daysLeft: '{0} days left',
        hoursLeft: '⚠️ {0}d {1}h left',
        minutesLeft: '🔥 {0}h {1}m left',
        urgentMinutes: '🔥🔥 {0}m left!',
        emptyTitle: 'Your wall is empty',
        emptyText: 'Click the button to add your first note!',
        priorityHigh: 'Urgent', priorityMedium: 'Normal', priorityLow: 'Low',
        sortBtn: 'Sort', placeholderTag: 'Add tag, press Enter',
        icsImport: 'Import ICS', icsNoEvents: 'No calendar events found',
        icsImported: 'Successfully imported {0} event(s)', recurring: 'Weekly recurring',
        clearExpired: 'Clear Expired', clearedCount: 'Cleared {0} expired item(s)', clearedNone: 'No expired items',
        repeatWeekly: 'Repeat weekly',
    }
};

function t(key, ...args) {
    let text = translations[currentLang][key] || key;
    args.forEach((arg, i) => { text = text.replace(`{${i}}`, arg); });
    return text;
}

// =========================================
// Language
// =========================================
function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('language', currentLang);
    updateUI();
    renderItems();
}

function updateUI() {
    const titleText = t('mainTitle').replace(/📌/g, '').trim();
    document.getElementById('mainTitle').innerText = titleText;
    document.getElementById('subtitle').innerText = t('subtitle');
    document.getElementById('sortText').innerText = t('sortBtn');
    const icsText = document.getElementById('importIcsText');
    if (icsText) icsText.innerText = t('icsImport');
}

// =========================================
// Note CRUD
// =========================================
function toggleAddNote() {
    if (isAdding) return;
    isAdding = true;
    editingItemId = null;

    const container = document.getElementById('notesContainer');
    document.getElementById('emptyState').style.display = 'none';
    container.insertAdjacentHTML('afterbegin', renderEditCard(null));
}

function cancelAction() {
    if (isAdding) {
        const card = document.querySelector('[data-id="new"]');
        if (card) card.remove();
        isAdding = false;
        if (items.length === 0) document.getElementById('emptyState').style.display = 'block';
    } else if (editingItemId) {
        const item = items.find(i => i.id === editingItemId);
        const card = document.querySelector(`[data-id="${editingItemId}"]`);
        if (card && item) card.outerHTML = renderViewCard(item);
        editingItemId = null;
    }
}

function enterEditMode(id) {
    isAdding = false;
    editingItemId = id;
    bringToFront(id);
    renderItems();
}

function bringToFront(id) {
    maxZIndex++;
    const item = items.find(i => i.id === id);
    if (item) {
        item.zIndex = maxZIndex;
        const el = document.querySelector(`[data-id="${id}"]`);
        if (el) el.style.zIndex = maxZIndex;
    }
}

function toggleTask(event, itemId, text, isCurrentlyChecked) {
    event.stopPropagation();

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const oldTask = isCurrentlyChecked ? `[x]${text}` : `[ ]${text}`;
    const newTask = isCurrentlyChecked ? `[ ]${text}` : `[x]${text}`;
    item.description = item.description.replace(oldTask, newTask);

    localStorage.setItem('ddlItems', JSON.stringify(items));

    const checkbox = event.target;
    const lineContainer = checkbox.closest('.checkbox-line');

    if (isCurrentlyChecked) {
        lineContainer.classList.remove('completed-task');
        checkbox.setAttribute('onclick', `toggleTask(event, ${itemId}, '${text}', false)`);
    } else {
        lineContainer.classList.add('completed-task');
        checkbox.setAttribute('onclick', `toggleTask(event, ${itemId}, '${text}', true)`);
    }
}

function saveNote(id) {
    const card = document.querySelector(`[data-id="${id || 'new'}"]`);
    const title = card.querySelector('.input-title').value;
    const description = card.querySelector('.input-desc').value;
    const priority = card.querySelector('.input-priority').value;
    const deadline = card.querySelector('.input-deadline')?.value;
    const repeatWeekly = card.querySelector('.input-repeat')?.checked || false;
    const color = card.style.backgroundColor;
    const tags = [...card.querySelectorAll('.tag-pills .note-tag')].map(el => el.firstChild.textContent.trim());

    if (!title) return alert("Please enter a title!");

    // Build recurrence data
    let recurrence = null;
    if (repeatWeekly && deadline) {
        const dt = new Date(deadline);
        const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        recurrence = {
            freq: 'WEEKLY',
            byDay: dayNames[dt.getDay()],
            originalDtstart: dt.toISOString(),
            interval: 1
        };
    }

    let newItem;
    if (id) {
        newItem = items.find(i => i.id === id);
        Object.assign(newItem, { title, description, priority, color, deadline, tags, type: deadline ? 'ddl' : 'note' });
        if (recurrence) {
            newItem.recurrence = recurrence;
        } else {
            delete newItem.recurrence;
        }
    } else {
        maxZIndex++;
        newItem = {
            id: Date.now(),
            type: deadline ? 'ddl' : 'note',
            title, description, priority, color, deadline, tags,
            createdAt: new Date().toISOString(),
            zIndex: maxZIndex,
            position: { x: Math.min(100, window.innerWidth - 300), y: 100 }
        };
        if (recurrence) {
            newItem.recurrence = recurrence;
        }
        items.unshift(newItem);
    }

    localStorage.setItem('ddlItems', JSON.stringify(items));

    const container = document.getElementById('notesContainer');
    if (id) {
        card.outerHTML = renderViewCard(newItem);
    } else {
        card.remove();
        container.insertAdjacentHTML('afterbegin', renderViewCard(newItem));
        document.getElementById('emptyState').style.display = 'none';
    }

    isAdding = false;
    editingItemId = null;
}

function deleteItem(id) {
    if (confirm("Delete this note?")) {
        items = items.filter(item => item.id !== id);
        localStorage.setItem('ddlItems', JSON.stringify(items));

        const el = document.querySelector(`[data-id="${id}"]`);
        if (el) {
            el.style.transform = 'scale(0)';
            setTimeout(() => {
                el.remove();
                if (items.length === 0) renderItems();
            }, 200);
        }
    }
}

// =========================================
// Drag & Drop
// =========================================
function startDrag(e, id) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') return;

    const card = e.currentTarget;
    draggedNote = { id, element: card };

    bringToFront(id);

    card.classList.add('dragging');
    const rect = card.getBoundingClientRect();
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    dragOffset.x = clientX - rect.left;
    dragOffset.y = clientY - rect.top;
}

function handleDragMove(clientX, clientY) {
    if (!draggedNote) return;
    const container = document.getElementById('notesContainer');
    const rect = container.getBoundingClientRect();

    let x = clientX - rect.left - dragOffset.x;
    let y = clientY - rect.top - dragOffset.y;

    draggedNote.element.style.left = x + 'px';
    draggedNote.element.style.top = y + 'px';
}

function handleDragEnd() {
    if (!draggedNote) return;
    draggedNote.element.classList.remove('dragging');
    const item = items.find(i => i.id === draggedNote.id);
    if (item) {
        item.position = {
            x: parseInt(draggedNote.element.style.left),
            y: parseInt(draggedNote.element.style.top)
        };
        localStorage.setItem('ddlItems', JSON.stringify(items));
        isSorted = false;
    }
    draggedNote = null;
}

document.addEventListener('mousemove', (e) => {
    handleDragMove(e.clientX, e.clientY);
});

document.addEventListener('mouseup', handleDragEnd);

document.addEventListener('touchmove', (e) => {
    if (!draggedNote) return;
    e.preventDefault();
    handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

document.addEventListener('touchend', handleDragEnd);

// =========================================
// Layout & Sort
// =========================================
function layoutNotes(notesList) {
    const container = document.getElementById('notesContainer');
    const containerWidth = container.clientWidth;
    const cardWidth = 280;
    const gap = 20;
    const cols = Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));

    if (notesList.length === 0) return;

    const totalGridWidth = cols * cardWidth + (cols - 1) * gap;
    const startX = Math.max(0, Math.floor((containerWidth - totalGridWidth) / 2));

    const rowHeights = [];
    const totalRows = Math.ceil(notesList.length / cols);
    for (let r = 0; r < totalRows; r++) {
        let maxH = 0;
        for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            if (idx >= notesList.length) break;
            const el = container.querySelector(`[data-id="${notesList[idx].id}"]`);
            if (el) maxH = Math.max(maxH, el.offsetHeight);
        }
        rowHeights.push(maxH);
    }

    notesList.forEach((item, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = startX + col * (cardWidth + gap);
        let y = 0;
        for (let r = 0; r < row; r++) {
            y += rowHeights[r] + gap;
        }

        item.position = { x, y };
        item.zIndex = 10 + index;

        const el = container.querySelector(`[data-id="${item.id}"]`);
        if (el) {
            el.style.transition = 'left 0.4s ease, top 0.4s ease';
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.zIndex = 10 + index;
            setTimeout(() => { el.style.transition = ''; }, 450);
        }
    });

    const totalHeight = rowHeights.reduce((sum, h) => sum + h + gap, 0);
    container.style.minHeight = (totalHeight + 50) + 'px';
    localStorage.setItem('ddlItems', JSON.stringify(items));
}

function getFilteredItems() {
    if (currentFilter !== 'all') {
        return items.filter(i => i.type === currentFilter || i.priority === currentFilter);
    }
    return [...items];
}

function sortNotes() {
    let filteredItems = getFilteredItems();
    if (filteredItems.length === 0) return;

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    filteredItems.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    layoutNotes(filteredItems);
    isSorted = true;
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const containerWidth = document.getElementById('notesContainer').clientWidth;
        const cardWidth = 280;
        const filteredItems = getFilteredItems();

        if (isSorted) {
            layoutNotes(filteredItems);
        } else {
            const overflow = filteredItems.some(item =>
                item.position && item.position.x + cardWidth > containerWidth
            );
            if (overflow) layoutNotes(filteredItems);
        }
    }, 150);
});

// =========================================
// Rendering
// =========================================
function renderItems() {
    const container = document.getElementById('notesContainer');
    const emptyState = document.getElementById('emptyState');

    let filteredItems = items;

    if (currentFilter !== 'all') {
        filteredItems = items.filter(i => i.type === currentFilter || i.priority === currentFilter);
    }

    if (filteredItems.length === 0 && !isAdding) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    let html = '';

    if (isAdding) {
        html += renderEditCard(null);
    }

    filteredItems.forEach(item => {
        if (editingItemId === item.id) {
            html += renderEditCard(item);
        } else {
            html += renderViewCard(item);
        }
    });

    container.innerHTML = html;
}

function renderViewCard(item) {
    const countdown = item.type === 'ddl' ? getCountdownForItem(item) : null;
    const pos = item.position || { x: 50, y: 50 };
    const zIndex = item.zIndex || 100;

    let processedContent = (item.description || '')
        .replace(/\[ \](.*)/g, '<div class="checkbox-line"><input type="checkbox" class="note-checkbox" onclick="toggleTask(event, ${item.id}, \'$1\', false)"> $1</div>')
        .replace(/\[x\](.*)/g, '<div class="checkbox-line completed-task"><input type="checkbox" class="note-checkbox" checked onclick="toggleTask(event, ${item.id}, \'$1\', true)"> $1</div>');

    processedContent = processedContent.split('${item.id}').join(item.id);

    const priorityIcons = {
        high: 'bolt',
        medium: 'bookmark',
        low: 'low_priority'
    };

    const typeIcon = item.type === 'ddl' ? 'calendar_month' : 'sticky_note_2';
    const typeText = item.type === 'ddl' ? t('typeDdl') : t('typeNote');

    return `
        <div class="note-card" data-id="${item.id}"
             style="background: ${item.color}; left: ${pos.x}px; top: ${pos.y}px; z-index: ${zIndex};"
             onmousedown="startDrag(event, ${item.id})" ontouchstart="startDrag(event, ${item.id})">
            <div class="note-header">
                <div class="note-title">${item.title}</div>
                <span class="priority-badge priority-${item.priority}">
                    <span class="material-symbols-outlined">${priorityIcons[item.priority]}</span>
                    ${t('priority' + item.priority.charAt(0).toUpperCase() + item.priority.slice(1))}
                </span>
            </div>
            ${(item.tags && item.tags.length) ? `<div class="note-tags">${item.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}</div>` : ''}
            ${countdown ? `<div class="countdown ${countdown.class}">${item.recurrence ? '<span class="material-symbols-outlined recurring-icon">repeat</span> ' : ''}${countdown.text}</div>` : ''}
            <div class="note-content">${processedContent}</div>
            <div class="note-footer">
                <span class="note-type">
                    <span class="material-symbols-outlined">${typeIcon}</span>
                    ${typeText}
                </span>
                <div class="note-actions">
                    <button class="edit-btn" onclick="enterEditMode(${item.id})" title="Edit">
                        <span class="material-symbols-outlined">edit_note</span>
                    </button>
                    <button class="delete-btn" onclick="deleteItem(${item.id})" title="Delete">
                        <span class="material-symbols-outlined">delete_forever</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function addTag(e) {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const input = e.target;
    const tag = input.value.replace(/,/g, '').trim();
    if (!tag) return;
    const container = input.closest('.tag-input-row').querySelector('.tag-pills');
    container.insertAdjacentHTML('beforeend',
        `<span class="note-tag edit-tag">${tag}<span class="tag-remove" onclick="this.parentElement.remove()">x</span></span>`
    );
    input.value = '';
}

function renderEditCard(item) {
    const isNew = !item;
    const title = isNew ? '' : item.title;
    const desc = isNew ? '' : item.description;
    const priority = isNew ? 'medium' : item.priority;
    const color = isNew ? '#ffd4b8' : item.color;
    const deadline = isNew ? '' : (item.deadline || '');
    const tags = isNew ? [] : (item.tags || []);
    const isRecurring = !isNew && !!item.recurrence;
    const pos = isNew ? { x: Math.min(100, window.innerWidth - 300), y: 10 } : item.position;
    const zIndex = isNew ? 9999 : (item.zIndex || 9999);

    const tagPills = tags.map(tag =>
        `<span class="note-tag edit-tag">${tag}<span class="tag-remove" onclick="this.parentElement.remove()">x</span></span>`
    ).join('');

    return `
        <div class="note-card editing" data-id="${isNew ? 'new' : item.id}"
             style="background: ${color}; left: ${pos.x}px; top: ${pos.y}px; z-index: ${zIndex};">
            <input type="text" class="input-title" placeholder="${t('placeholderTitle')}" value="${title}">
            <textarea class="input-desc" placeholder="${t('placeholderDesc')}">${desc}</textarea>
            <div class="edit-controls">
                <select class="input-priority">
                    <option value="high" ${priority === 'high' ? 'selected' : ''}>${t('priorityHigh')}</option>
                    <option value="medium" ${priority === 'medium' ? 'selected' : ''}>${t('priorityMedium')}</option>
                    <option value="low" ${priority === 'low' ? 'selected' : ''}>${t('priorityLow')}</option>
                </select>
                <input type="datetime-local" class="input-deadline" value="${deadline}">
                <label class="repeat-toggle">
                    <input type="checkbox" class="input-repeat" ${isRecurring ? 'checked' : ''}>
                    <span class="material-symbols-outlined" style="font-size:16px">repeat</span>
                    ${t('repeatWeekly')}
                </label>
            </div>
            <div class="tag-input-row">
                <div class="tag-pills">${tagPills}</div>
                <input type="text" class="input-tag" placeholder="${t('placeholderTag')}" onkeydown="addTag(event)">
            </div>
            <div class="color-row">
                ${['#ffd4b8', '#ffb8c6', '#c8f0d4', '#e0d4ff', '#c8e4ff', '#fff9c4'].map(c =>
                `<div class="color-dot ${color === c ? 'active' : ''}" style="background:${c}" onclick="this.parentElement.parentElement.style.background='${c}'"></div>`
            ).join('')}
            </div>
            <div class="note-footer">
                <button class="cancel-btn" onclick="cancelAction()">${t('btnCancel')}</button>
                <button class="save-btn" onclick="saveNote(${isNew ? null : item.id})">${t('btnSave')}</button>
            </div>
        </div>
    `;
}

// =========================================
// Countdown & Recurrence
// =========================================
function getCountdown(deadline) {
    const diff = new Date(deadline) - new Date();
    if (diff < 0) return { text: t('expired'), class: '' };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 7) return { text: t('daysLeft', days), class: 'safe' };
    if (days > 0) return { text: t('hoursLeft', days, hours), class: 'warning' };
    return { text: t('urgentMinutes', Math.floor(diff / 60000)), class: '' };
}

function getCountdownForItem(item) {
    if (item.recurrence) {
        const now = new Date();
        if (new Date(item.deadline) < now) {
            item.deadline = getNextOccurrence(item.recurrence, item.recurrence.originalDtstart);
            localStorage.setItem('ddlItems', JSON.stringify(items));
        }
    }
    return getCountdown(item.deadline);
}

function getNextOccurrence(recurrence, originalDtstart) {
    const now = new Date();
    let dt = new Date(originalDtstart);
    const intervalMs = (recurrence.interval || 1) * 7 * 86400000;

    if (dt > now) return dt.toISOString();

    const diffMs = now - dt;
    const intervalsNeeded = Math.ceil(diffMs / intervalMs);
    dt = new Date(dt.getTime() + intervalsNeeded * intervalMs);

    if (dt <= now) {
        dt = new Date(dt.getTime() + intervalMs);
    }
    return dt.toISOString();
}

// =========================================
// ICS Import
// =========================================
function parseICSDate(value) {
    const clean = value.replace(/[^0-9TZ]/g, '');
    if (clean.length === 8) {
        return new Date(clean.slice(0, 4) + '-' + clean.slice(4, 6) + '-' + clean.slice(6, 8)).toISOString();
    }
    const iso = clean.slice(0, 4) + '-' + clean.slice(4, 6) + '-' + clean.slice(6, 8)
        + 'T' + clean.slice(9, 11) + ':' + clean.slice(11, 13) + ':' + clean.slice(13, 15);
    if (clean.endsWith('Z')) return new Date(iso + 'Z').toISOString();
    return new Date(iso).toISOString();
}

function parseRRule(value) {
    const parts = {};
    value.split(';').forEach(p => {
        const [k, v] = p.split('=');
        parts[k] = v;
    });
    return parts;
}

function parseICS(text) {
    const events = [];
    const unfolded = text.replace(/\r\n[ \t]/g, '');
    const lines = unfolded.split(/\r?\n/);

    let inEvent = false;
    let event = {};

    for (const line of lines) {
        if (line === 'BEGIN:VEVENT') {
            inEvent = true;
            event = {};
        } else if (line === 'END:VEVENT') {
            inEvent = false;
            events.push(event);
        } else if (inEvent) {
            const colonIdx = line.indexOf(':');
            if (colonIdx === -1) continue;
            const key = line.substring(0, colonIdx);
            const value = line.substring(colonIdx + 1);
            const baseProp = key.split(';')[0];

            if (baseProp === 'SUMMARY') event.summary = value;
            else if (baseProp === 'DESCRIPTION') event.description = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
            else if (baseProp === 'DTSTART') event.dtstart = parseICSDate(value);
            else if (baseProp === 'DTEND') event.dtend = parseICSDate(value);
            else if (baseProp === 'RRULE') event.rrule = parseRRule(value);
        }
    }
    return events;
}

function handleICSImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const dayTagMap = {
        'MO': currentLang === 'zh' ? '周一' : 'Mon',
        'TU': currentLang === 'zh' ? '周二' : 'Tue',
        'WE': currentLang === 'zh' ? '周三' : 'Wed',
        'TH': currentLang === 'zh' ? '周四' : 'Thu',
        'FR': currentLang === 'zh' ? '周五' : 'Fri',
        'SA': currentLang === 'zh' ? '周六' : 'Sat',
        'SU': currentLang === 'zh' ? '周日' : 'Sun'
    };

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const events = parseICS(text);

        if (events.length === 0) {
            alert(t('icsNoEvents'));
            return;
        }

        // Separate: events with explicit RRULE vs plain events
        const rruleEvents = [];
        const plainEvents = [];
        events.forEach(ev => {
            if (!ev.summary) return;
            if (ev.rrule && ev.rrule.FREQ === 'WEEKLY') {
                rruleEvents.push(ev);
            } else {
                plainEvents.push(ev);
            }
        });

        // Auto-detect weekly patterns in plain events:
        // Group by "summary | dayOfWeek | HH:MM"
        const groups = {};
        plainEvents.forEach(ev => {
            const deadline = ev.dtstart || ev.dtend || '';
            if (!deadline) return;
            const dt = new Date(deadline);
            const day = dayNames[dt.getDay()];
            const time = dt.getHours().toString().padStart(2, '0') + ':' + dt.getMinutes().toString().padStart(2, '0');
            const key = `${ev.summary}|${day}|${time}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(ev);
        });

        let imported = 0;

        // Import explicit RRULE weekly events
        rruleEvents.forEach(ev => {
            const deadline = ev.dtstart || ev.dtend || '';
            const dtstart = new Date(deadline);
            const byDay = (ev.rrule.BYDAY || dayNames[dtstart.getDay()]).split(',')[0];

            const recurrence = {
                freq: 'WEEKLY',
                byDay: byDay,
                originalDtstart: deadline,
                interval: parseInt(ev.rrule.INTERVAL) || 1
            };

            const tags = ['ics-import', dayTagMap[byDay] || byDay];
            const nextDeadline = getNextOccurrence(recurrence, deadline);

            maxZIndex++;
            items.unshift({
                id: Date.now() + imported,
                type: 'ddl',
                title: ev.summary,
                description: ev.description || '',
                priority: 'medium',
                color: '#c8e4ff',
                deadline: nextDeadline,
                tags: tags,
                createdAt: new Date().toISOString(),
                zIndex: maxZIndex,
                position: { x: Math.min(100 + imported * 30, window.innerWidth - 300), y: 100 + imported * 30 },
                recurrence: recurrence
            });
            imported++;
        });

        // Import grouped plain events
        const now = new Date();
        for (const key in groups) {
            const group = groups[key];
            const [summary, day] = key.split('|');
            const firstEv = group[0];
            const deadline = firstEv.dtstart || firstEv.dtend || '';

            if (group.length >= 2) {
                // Auto-detected weekly pattern → merge into one recurring note
                // Pick the earliest event as originalDtstart
                const earliest = group.reduce((a, b) => {
                    const da = new Date(a.dtstart || a.dtend);
                    const db = new Date(b.dtstart || b.dtend);
                    return da < db ? a : b;
                });
                const originalDtstart = earliest.dtstart || earliest.dtend;

                const recurrence = {
                    freq: 'WEEKLY',
                    byDay: day,
                    originalDtstart: originalDtstart,
                    interval: 1
                };

                const tags = ['ics-import', dayTagMap[day] || day];
                const nextDeadline = getNextOccurrence(recurrence, originalDtstart);
                const desc = firstEv.description || '';

                maxZIndex++;
                items.unshift({
                    id: Date.now() + imported,
                    type: 'ddl',
                    title: summary,
                    description: desc,
                    priority: 'medium',
                    color: '#c8e4ff',
                    deadline: nextDeadline,
                    tags: tags,
                    createdAt: new Date().toISOString(),
                    zIndex: maxZIndex,
                    position: { x: Math.min(100 + imported * 30, window.innerWidth - 300), y: 100 + imported * 30 },
                    recurrence: recurrence
                });
                imported++;
            } else {
                // Single occurrence, import as normal (skip if expired)
                if (deadline && new Date(deadline) < now) return;

                maxZIndex++;
                items.unshift({
                    id: Date.now() + imported,
                    type: 'ddl',
                    title: summary,
                    description: firstEv.description || '',
                    priority: 'medium',
                    color: '#c8e4ff',
                    deadline: deadline,
                    tags: ['ics-import'],
                    createdAt: new Date().toISOString(),
                    zIndex: maxZIndex,
                    position: { x: Math.min(100 + imported * 30, window.innerWidth - 300), y: 100 + imported * 30 }
                });
                imported++;
            }
        }

        localStorage.setItem('ddlItems', JSON.stringify(items));
        renderItems();
        alert(t('icsImported', imported));
    };

    reader.readAsText(file);
    event.target.value = '';
}

// =========================================
// Clear Expired
// =========================================
function clearExpired() {
    const now = new Date();
    const expiredItems = items.filter(item =>
        item.type === 'ddl' && !item.recurrence && item.deadline && new Date(item.deadline) < now
    );

    if (expiredItems.length === 0) {
        alert(t('clearedNone'));
        return;
    }

    const expiredIds = new Set(expiredItems.map(i => i.id));
    items = items.filter(i => !expiredIds.has(i.id));
    localStorage.setItem('ddlItems', JSON.stringify(items));
    renderItems();
    alert(t('clearedCount', expiredItems.length));
}

// =========================================
// Filter
// =========================================
function filterItems(f) {
    currentFilter = f;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderItems();
}

// =========================================
// Project TODO Panel
// =========================================
function toggleTodoPanel() {
    const panel = document.getElementById('todoPanel');
    panel.classList.toggle('open');
    const icon = document.getElementById('todoToggleIcon');
    icon.textContent = panel.classList.contains('open') ? '❌' : '📋';
}

function saveSpecialTodos() {
    const text = document.getElementById('specialTodoInput').value;
    localStorage.setItem('project_todos', text);
    renderSpecialTodos();
}

function renderSpecialTodos() {
    const text = localStorage.getItem('project_todos') || "";
    document.getElementById('specialTodoInput').value = text;

    const listContainer = document.getElementById('specialTodoList');

    const html = text.split('\n').map((line, index) => {
        if (line.startsWith('[ ]')) {
            const content = line.replace('[ ]', '').trim();
            return `<div class="checkbox-line">
                <input type="checkbox" class="note-checkbox" onclick="toggleSpecialTask(${index}, false)">
                <span>${content}</span>
            </div>`;
        } else if (line.startsWith('[x]')) {
            const content = line.replace('[x]', '').trim();
            return `<div class="checkbox-line completed-task">
                <input type="checkbox" class="note-checkbox" checked onclick="toggleSpecialTask(${index}, true)">
                <span>${content}</span>
            </div>`;
        }
        return line ? `<div style="margin-bottom:5px">${line}</div>` : '';
    }).join('');

    listContainer.innerHTML = html;
}

function toggleSpecialTask(lineIndex, isDone) {
    let lines = localStorage.getItem('project_todos').split('\n');
    if (isDone) {
        lines[lineIndex] = lines[lineIndex].replace('[x]', '[ ]');
    } else {
        lines[lineIndex] = lines[lineIndex].replace('[ ]', '[x]');
    }
    const newText = lines.join('\n');
    localStorage.setItem('project_todos', newText);
    renderSpecialTodos();
}

// =========================================
// Init
// =========================================
window.addEventListener('load', () => {
    renderSpecialTodos();
});

updateUI();
renderItems();
