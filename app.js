// アプリの状態管理
let tasks = [];
let currentFilter = 'all';

// DOM要素の取得
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskStats = document.getElementById('taskStats');

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateStats();
});

// タスクの追加
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('タスクを入力してください');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    updateStats();

    // フォームのリセット
    taskInput.value = '';
    dueDateInput.value = '';
    prioritySelect.value = 'medium';
    taskInput.focus();
}

// タスクの削除
function deleteTask(id) {
    if (confirm('このタスクを削除してもよろしいですか？')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// タスクの完了/未完了の切り替え
function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// タスクの編集
function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    const newText = prompt('タスクを編集:', task.text);
    if (newText && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks();
        renderTasks();
    }
}

// タスクの表示
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<li class="empty-state">タスクがありません</li>';
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        const priorityLabel = {
            high: '高',
            medium: '中',
            low: '低'
        };

        return `
            <li class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority} ${isOverdue ? 'overdue' : ''}" data-id="${task.id}">
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask(${task.id})"
                />
                <div class="task-details">
                    <div class="task-content">${escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="priority-badge priority-${task.priority}">
                            優先度: ${priorityLabel[task.priority]}
                        </span>
                        ${task.dueDate ? `
                            <span class="due-date ${isOverdue ? 'text-danger' : ''}">
                                📅 ${formatDate(task.dueDate)} ${isOverdue ? '(期限切れ)' : ''}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn btn-edit" onclick="editTask(${task.id})">編集</button>
                    <button class="task-btn btn-delete" onclick="deleteTask(${task.id})">削除</button>
                </div>
            </li>
        `;
    }).join('');
}

// フィルタリング
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'high':
            return tasks.filter(task => task.priority === 'high');
        default:
            return tasks;
    }
}

// 統計情報の更新
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;

    taskStats.textContent = `タスク: ${total}個 (未完了: ${active}個, 完了: ${completed}個)`;
}

// ローカルストレージへの保存
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ローカルストレージから読み込み
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// ユーティリティ関数
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ソート機能（優先度順）
function sortTasksByPriority() {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    tasks.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    renderTasks();
}
