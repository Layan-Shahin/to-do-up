class Task {
    id: number;
    title: string;
    desc: string;
    done: boolean;

    constructor(id: number, title: string, desc: string, done = false) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.done = done;
    }

    toggle(): void {
        this.done = !this.done;
    }
}

const MY_ID = 'LS';

const members: Record<string, { name: string; initials: string }> = {
    LS: { name: 'Layan Shahin',  initials: 'LS' },
    mr: { name: 'Marcus Rivera', initials: 'MR' },
    ps: { name: 'Priya Sharma',  initials: 'PS' },
    at: { name: 'Alex Thompson', initials: 'AT' },
    jl: { name: 'Jordan Lee',    initials: 'JL' },
};



const tasks: Record<string, Task[]> = { LS: [], mr: [], ps: [], at: [], jl: [] };

let currentMember = MY_ID;

async function loadTasks() {
    const responce = await fetch('/todos',{
        method: 'GET',
    });
    
    const body=await responce.json();
    tasks[currentMember]=body.map((t:any)=>new Task(t.id,t.title,t.description,t.completed));
    renderTasks(currentMember);
    updateSidebarCounts();
}

function renderTasks(memberId: string): void {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    taskList.innerHTML = '';

    const memberTasks = tasks[memberId];
    if (!memberTasks) return;

    const isMe = memberId === MY_ID;

    memberTasks.forEach((task: Task) => {
        const card = document.createElement('div');
        card.className = 'task-card' + (task.done ? ' done' : '');
        card.id =String(task.id);

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

function selectMember(id: string): void {
    document.querySelectorAll('.member-item').forEach(el => el.classList.remove('active'));
    document.getElementById('mem-' + id)?.classList.add('active');

    currentMember = id;
    const isMe = id === MY_ID;

    const title = document.getElementById('page-title');
    const badge = document.getElementById('view-only-badge');
    const fab   = document.getElementById('fab-btn');

    if (title) title.textContent = isMe ? 'My Tasks' : members[id].name + "'s Tasks";
    if (badge) badge.style.display = isMe ? 'none' : 'inline-block';
    if (fab)   fab.style.display   = isMe ? 'flex'  : 'none';

    renderTasks(id);
}

function toggleTask(id: string): void {
    const task = tasks[currentMember]?.find(t => t.id === Number(id));
    if (!task) return;

    task.toggle();   
    renderTasks(currentMember);
    updateSidebarCounts();
}

function deleteTask(id: string): void {
    tasks[currentMember] = tasks[currentMember].filter(t => t.id !==Number( id));
    renderTasks(currentMember);
    updateSidebarCounts();
}

function openEditModal(id: string): void {
    
    hideError('error-titleEdit');
    hideError('error-descEdit');
    
    const task = tasks[currentMember].find(t => t.id ===Number(id));
    if (!task) return;

    const overlay = document.getElementById('edit-modal-overlay');
    if (!overlay) return;

    (document.getElementById('edit-modal-id') as HTMLInputElement).value = id;
    (document.getElementById('edit-title-input') as HTMLInputElement).value = task.title;
    (document.getElementById('edit-desc-input') as HTMLTextAreaElement).value = task.desc;

    overlay.classList.add('open');
}

function closeEditModal(): void {
    document.getElementById('edit-modal-overlay')?.classList.remove('open');
    hideError('error-titleEdit');
    hideError('error-descEdit');
}

async function submitEdit():Promise <void> {
    const id    = (document.getElementById('edit-modal-id')    as HTMLInputElement).value;
    const title = (document.getElementById('edit-title-input') as HTMLInputElement).value.trim();
    const desc  = (document.getElementById('edit-desc-input')  as HTMLTextAreaElement).value.trim();
    
    hideError('error-titleEdit');
    hideError('error-descEdit');
    
    const task = tasks[currentMember].find(t => t.id ===Number(id));
    if (!task) return;
    
    const reponse=await fetch(`/todos/${id}`,{
        method: 'PUT',
        body: JSON.stringify({title:title,description:desc}),
        headers: {'Content-Type': 'application/json'}
    });

    if (reponse.status===400) {
        const body = await reponse.json();
        if (body.errors.Title) showError(body.errors.Title[0], 'error-titleEdit');
        if (body.errors.Description) showError(body.errors.Description[0], 'error-descEdit');
    }else{
        task.title = title;
        task.desc  = desc || '—';
        renderTasks(currentMember);
        closeEditModal();
    }
    
    
}

function openModal(): void {
    document.getElementById('modal-overlay')?.classList.add('open');
    (document.getElementById('modal-title-input') as HTMLInputElement).value = '';
    (document.getElementById('modal-desc-input')  as HTMLTextAreaElement).value = '';
}

function closeModal(): void {
    document.getElementById('modal-overlay')?.classList.remove('open');
    hideError('error-title');
    hideError('error-desc');
}

async function submitTask():Promise<void> {
    const titleInput = document.getElementById('modal-title-input') as HTMLInputElement;
    const descInput  = document.getElementById('modal-desc-input')  as HTMLTextAreaElement;

    const title = titleInput.value.trim();
    const desc  = descInput.value.trim();
    
    hideError('error-title');
    hideError('error-desc');
    
    const reponse=await fetch("/todos",{
        method: 'POST',
        body: JSON.stringify({title:title,description:desc}),
        headers: {'Content-Type': 'application/json'}
    });
    
    const body = await reponse.json();
    
    if (reponse.status===400) {
        showError(body.errors.Title[0], 'error-title');
        showError(body.errors.Description[0], 'error-desc');
    }else{
        const newTask=new Task(body.id,body.title,body.description);
        tasks[currentMember].push(newTask);
        renderTasks(currentMember);
        updateSidebarCounts();
        closeModal();
    }        
    
}

function showError(msg: string,id:string): void {
    const span=document.getElementById(id);
    
     if (span){
         span.textContent = msg; 
         span.style.display='block';
     } 
    
}

function hideError(id:string): void {
    const span=document.getElementById(id);
    if (span){
        span.textContent = '';
        span.style.display='none';
    }
}

function updateSidebarCounts(): void {
    Object.keys(tasks).forEach(memberId => {
        const memberTasks = tasks[memberId];
        const total = memberTasks.length;
        const done  = memberTasks.filter(t => t.done).length; 

        const item = document.getElementById("mem-" + memberId);
        if (!item) return;

        const badge    = item.querySelector('.member-count-badge');
        const progress = item.querySelector('.member-progress');

        if (badge)    badge.textContent    = String(total);
        if (progress) progress.textContent = `${done}/${total}`;
    })
}

loadTasks().then(()=>selectMember(MY_ID));
