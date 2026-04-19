"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Task {
    constructor(id, title, desc, done = false) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.done = done;
    }
    toggle() {
        this.done = !this.done;
    }
}
const MY_ID = 'LS';
const members = {
    LS: { name: 'Layan Shahin', initials: 'LS' },
    mr: { name: 'Marcus Rivera', initials: 'MR' },
    ps: { name: 'Priya Sharma', initials: 'PS' },
    at: { name: 'Alex Thompson', initials: 'AT' },
    jl: { name: 'Jordan Lee', initials: 'JL' },
};
const tasks = { LS: [], mr: [], ps: [], at: [], jl: [] };
let currentMember = MY_ID;
function loadTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        const responce = yield fetch('/todos', {
            method: 'GET',
        });
        const body = yield responce.json();
        tasks[currentMember] = body.map((t) => new Task(t.id, t.title, t.description, t.completed));
        renderTasks(currentMember);
        updateSidebarCounts();
    });
}
function renderTasks(memberId) {
    const taskList = document.getElementById('task-list');
    if (!taskList)
        return;
    taskList.innerHTML = '';
    const memberTasks = tasks[memberId];
    if (!memberTasks)
        return;
    const isMe = memberId === MY_ID;
    memberTasks.forEach((task) => {
        const card = document.createElement('div');
        card.className = 'task-card' + (task.done ? ' done' : '');
        card.id = String(task.id);
        card.innerHTML = `
      <div class="task-checkbox ${task.done ? 'checked' : ''}"
           onclick="toggleTask('${task.id}')"></div>
      <div class="task-body">
        <div class="task-title">${task.title}</div>
        <div class="task-desc">${task.desc}</div>
       
      </div>
      ${isMe ? `
        <div class="task-actions">
          <button class="action-btn edit-btn" title="Edit" onclick="openEditModal('${task.id}')">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"/>
            </svg>
          </button>
          <button class="action-btn delete-btn" title="Delete" onclick="deleteTask('${task.id}')">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5L11 4"/>
            </svg>
          </button>
        </div>` : ''}
    `;
        taskList.appendChild(card);
    });
}
function selectMember(id) {
    var _a;
    document.querySelectorAll('.member-item').forEach(el => el.classList.remove('active'));
    (_a = document.getElementById('mem-' + id)) === null || _a === void 0 ? void 0 : _a.classList.add('active');
    currentMember = id;
    const isMe = id === MY_ID;
    const title = document.getElementById('page-title');
    const badge = document.getElementById('view-only-badge');
    const fab = document.getElementById('fab-btn');
    if (title)
        title.textContent = isMe ? 'My Tasks' : members[id].name + "'s Tasks";
    if (badge)
        badge.style.display = isMe ? 'none' : 'inline-block';
    if (fab)
        fab.style.display = isMe ? 'flex' : 'none';
    renderTasks(id);
}
function toggleTask(id) {
    var _a;
    const task = (_a = tasks[currentMember]) === null || _a === void 0 ? void 0 : _a.find(t => t.id === Number(id));
    if (!task)
        return;
    task.toggle();
    renderTasks(currentMember);
    updateSidebarCounts();
}
function deleteTask(id) {
    tasks[currentMember] = tasks[currentMember].filter(t => t.id !== Number(id));
    renderTasks(currentMember);
    updateSidebarCounts();
}
function openEditModal(id) {
    hideError('error-titleEdit');
    hideError('error-descEdit');
    const task = tasks[currentMember].find(t => t.id === Number(id));
    if (!task)
        return;
    const overlay = document.getElementById('edit-modal-overlay');
    if (!overlay)
        return;
    document.getElementById('edit-modal-id').value = id;
    document.getElementById('edit-title-input').value = task.title;
    document.getElementById('edit-desc-input').value = task.desc;
    overlay.classList.add('open');
}
function closeEditModal() {
    var _a;
    (_a = document.getElementById('edit-modal-overlay')) === null || _a === void 0 ? void 0 : _a.classList.remove('open');
    hideError('error-titleEdit');
    hideError('error-descEdit');
}
function submitEdit() {
    return __awaiter(this, void 0, void 0, function* () {
        const id = document.getElementById('edit-modal-id').value;
        const title = document.getElementById('edit-title-input').value.trim();
        const desc = document.getElementById('edit-desc-input').value.trim();
        hideError('error-titleEdit');
        hideError('error-descEdit');
        const task = tasks[currentMember].find(t => t.id === Number(id));
        if (!task)
            return;
        const reponse = yield fetch(`/todos/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title: title, description: desc }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (reponse.status === 400) {
            const body = yield reponse.json();
            if (body.errors.Title)
                showError(body.errors.Title[0], 'error-titleEdit');
            if (body.errors.Description)
                showError(body.errors.Description[0], 'error-descEdit');
        }
        else {
            task.title = title;
            task.desc = desc || '—';
            renderTasks(currentMember);
            closeEditModal();
        }
    });
}
function openModal() {
    var _a;
    (_a = document.getElementById('modal-overlay')) === null || _a === void 0 ? void 0 : _a.classList.add('open');
    document.getElementById('modal-title-input').value = '';
    document.getElementById('modal-desc-input').value = '';
}
function closeModal() {
    var _a;
    (_a = document.getElementById('modal-overlay')) === null || _a === void 0 ? void 0 : _a.classList.remove('open');
    hideError('error-title');
    hideError('error-desc');
}
function submitTask() {
    return __awaiter(this, void 0, void 0, function* () {
        const titleInput = document.getElementById('modal-title-input');
        const descInput = document.getElementById('modal-desc-input');
        const title = titleInput.value.trim();
        const desc = descInput.value.trim();
        hideError('error-title');
        hideError('error-desc');
        const reponse = yield fetch("/todos", {
            method: 'POST',
            body: JSON.stringify({ title: title, description: desc }),
            headers: { 'Content-Type': 'application/json' }
        });
        const body = yield reponse.json();
        if (reponse.status === 400) {
            showError(body.errors.Title[0], 'error-title');
            showError(body.errors.Description[0], 'error-desc');
        }
        else {
            const newTask = new Task(body.id, body.title, body.description);
            tasks[currentMember].push(newTask);
            renderTasks(currentMember);
            updateSidebarCounts();
            closeModal();
        }
    });
}
function showError(msg, id) {
    const span = document.getElementById(id);
    if (span) {
        span.textContent = msg;
        span.style.display = 'block';
    }
}
function hideError(id) {
    const span = document.getElementById(id);
    if (span) {
        span.textContent = '';
        span.style.display = 'none';
    }
}
function updateSidebarCounts() {
    console.log('updateSidebarCounts ran');
    console.log('tasks:', tasks);
    Object.keys(tasks).forEach(memberId => {
        const memberTasks = tasks[memberId];
        const total = memberTasks.length;
        const done = memberTasks.filter(t => t.done).length;
        const item = document.getElementById("mem-" + memberId);
        if (!item)
            return;
        const badge = item.querySelector('.member-count-badge');
        const progress = item.querySelector('.member-progress');
        if (badge)
            badge.textContent = String(total);
        if (progress)
            progress.textContent = `${done}/${total}`;
    });
}
loadTasks().then(() => selectMember(MY_ID));
