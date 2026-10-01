const STORAGE_KEY = 'karnow.tasks.v1';

const $ = id => document.getElementById(id);
const els = {
  form: $('addForm'), input: $('taskInput'), list: $('taskList'),
  empty: $('empty'), total: $('totalCount'), done: $('doneCount'),
  percent: $('progressPercent'), fill: $('progressFill'),
  date: $('date'), footer: $('footer'), clearDone: $('clearDone'),
};

let tasks = load();

function load(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function setDate(){
  els.date.textContent = new Intl.DateTimeFormat('fa-IR',{
    weekday:'long', day:'numeric', month:'long'
  }).format(new Date());
}

function render(){
  els.list.innerHTML = '';

  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task' + (t.done ? ' done' : '');
    li.dataset.id = t.id;
    li.innerHTML = `
      <button class="check" aria-label="تغییر وضعیت">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </button>
      <span class="task-text"></span>
      <button class="delete" aria-label="حذف">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/>
        </svg>
      </button>
    `;
    li.querySelector('.task-text').textContent = t.text;
    els.list.appendChild(li);
  });

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  els.total.textContent = total;
  els.done.textContent = done;
  els.percent.textContent = pct + '%';
  els.fill.style.width = pct + '%';

  els.empty.classList.toggle('show', total === 0);
  els.footer.classList.toggle('show', done > 0);

  save();
}

function addTask(text){
  tasks.unshift({ id: uid(), text, done: false, createdAt: Date.now() });
  render();
}

function toggleTask(id){
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  render();
}

function removeTask(id){
  const li = els.list.querySelector(`[data-id="${id}"]`);
  if (li){
    li.classList.add('removing');
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      render();
    }, 260);
  } else {
    tasks = tasks.filter(t => t.id !== id);
    render();
  }
}

/* رویدادها */
els.form.addEventListener('submit', e => {
  e.preventDefault();
  const val = els.input.value.trim();
  if (!val) return;
  addTask(val);
  els.input.value = '';
  els.input.focus();
});

els.list.addEventListener('click', e => {
  const li = e.target.closest('.task');
  if (!li) return;
  const id = li.dataset.id;
  if (e.target.closest('.check')) toggleTask(id);
  else if (e.target.closest('.delete')) removeTask(id);
});

els.clearDone.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  render();
});

/* راه‌اندازی */
setDate();
render();

/* PWA */
if ('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
