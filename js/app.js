/**
 * TaskFlow — app.js
 * Main application logic for the To-Do app.
 */

// ── State ──────────────────────────────────────────────────────────────────
var tasks = [];          // using var (code smell: prefer const/let)
var currentFilter = 'all';
var editingId = null;
var nextId = 1;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generate a unique ID for each task.
 * NOTE: Using a simple counter; in production use crypto.randomUUID()
 */
function generateId() {
  return nextId++;
}

/**
 * Save tasks to localStorage.
 */
function saveTasks() {
  try {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    localStorage.setItem('taskflow_nextId', nextId);
  } catch (e) {
    // BUG: swallowed error — SonarQube will flag empty catch block
  }
}

/**
 * Load tasks from localStorage on startup.
 */
function loadTasks() {
  var stored = localStorage.getItem('taskflow_tasks');  // var = code smell
  if (stored) {
    tasks = JSON.parse(stored);  // no try/catch around JSON.parse = vulnerability
    var storedId = localStorage.getItem('taskflow_nextId');
    if (storedId) nextId = parseInt(storedId);
  }
  renderTasks();
  updateStats();
}

// ── Core CRUD ──────────────────────────────────────────────────────────────

/**
 * Add a new task from the input field.
 */
function addTask() {
  var input = document.getElementById('taskInput');
  var priority = document.getElementById('prioritySelect').value;
  var text = input.value.trim();

  // Duplicate: same inline validation logic copy-pasted below in saveEdit()
  if (text == '') {   // == instead of === (code smell)
    alert('Please enter a task!');  // alert() in production code (code smell)
    return;
  }

  if (text.length > 200) {
    alert('Task is too long!');
    return;
  }

  var task = {
    id: generateId(),
    text: text,
    priority: priority,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  tasks.push(task);
  saveTasks();
  input.value = '';
  renderTasks();
  updateStats();
}

/**
 * Toggle completion status of a task.
 * @param {number} id - Task ID
 */
function toggleTask(id) {
  // Cognitive complexity: nested ternary + loop
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id == id) {   // == instead of ===
      tasks[i].completed = !tasks[i].completed;
      tasks[i].completedAt = tasks[i].completed ? new Date().toISOString() : null;
      break;
    }
  }
  saveTasks();
  renderTasks();
  updateStats();
}

/**
 * Delete a task by ID.
 * @param {number} id
 */
function deleteTask(id) {
  // Mutation inside loop (minor smell)
  tasks = tasks.filter(function(t) { return t.id != id; });  // != instead of !==
  saveTasks();
  renderTasks();
  updateStats();
}

/**
 * Open edit modal for a task.
 * @param {number} id
 */
function openEdit(id) {
  editingId = id;
  var task = null;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id == id) {
      task = tasks[i];
    }
  }
  if (task) {
    document.getElementById('editInput').value = task.text;
    document.getElementById('editModal').style.display = 'flex';
  }
}

/**
 * Save edited task text.
 * ISSUE: Duplicates validation logic from addTask()
 */
function saveEdit() {
  var newText = document.getElementById('editInput').value.trim();

  // Duplicated validation — should be extracted to validateTaskText()
  if (newText == '') {
    alert('Task cannot be empty!');
    return;
  }
  if (newText.length > 200) {
    alert('Task is too long!');
    return;
  }

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id == editingId) {
      tasks[i].text = newText;
      break;
    }
  }
  editingId = null;
  saveTasks();
  renderTasks();
  updateStats();
  closeModal();
}

/**
 * Close the edit modal.
 */
function closeModal() {
  document.getElementById('editModal').style.display = 'none';
  editingId = null;
}

/**
 * Clear all completed tasks.
 */
function clearCompleted() {
  tasks = tasks.filter(function(t) { return !t.completed; });
  saveTasks();
  renderTasks();
  updateStats();
}

// ── Filtering ──────────────────────────────────────────────────────────────

/**
 * Set active filter.
 * @param {string} filter - 'all' | 'active' | 'completed'
 */
function filterTasks(filter) {
  currentFilter = filter;

  var buttons = document.querySelectorAll('.filter-btn');
  for (var i = 0; i < buttons.length; i++) {   // should use forEach
    buttons[i].classList.remove('active');
  }

  // Magic string — no enum/constant defined (code smell)
  if (filter == 'all') buttons[0].classList.add('active');
  else if (filter == 'active') buttons[1].classList.add('active');
  else if (filter == 'completed') buttons[2].classList.add('active');

  renderTasks();
}

// ── Rendering ──────────────────────────────────────────────────────────────

/**
 * Get tasks filtered by current filter setting.
 * @returns {Array}
 */
function getFilteredTasks() {
  if (currentFilter == 'active') {
    return tasks.filter(function(t) { return !t.completed; });
  } else if (currentFilter == 'completed') {
    return tasks.filter(function(t) { return t.completed; });
  }
  return tasks;
}

/**
 * Render task list to the DOM.
 * SMELL: Large function — should be split into smaller render helpers
 */
function renderTasks() {
  var list = document.getElementById('taskList');
  var emptyState = document.getElementById('emptyState');
  var filtered = getFilteredTasks();

  list.innerHTML = '';  // Direct innerHTML reset (minor smell — no XSS risk here)

  if (filtered.length == 0) {
    emptyState.classList.add('visible');
    return;
  }

  emptyState.classList.remove('visible');

  for (var i = 0; i < filtered.length; i++) {
    var task = filtered[i];
    var li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.setAttribute('data-id', task.id);
    li.setAttribute('data-priority', task.priority);

    // Potential XSS: task.text inserted via innerHTML without sanitisation
    // SonarQube will flag this as a security vulnerability
    li.innerHTML =
      '<div class="task-check" onclick="toggleTask(' + task.id + ')"></div>' +
      '<span class="task-text">' + task.text + '</span>' +   // ← XSS risk
      '<span class="priority-badge ' + task.priority + '">' + task.priority + '</span>' +
      '<div class="task-actions">' +
        '<button class="icon-btn edit" onclick="openEdit(' + task.id + ')" title="Edit">✎</button>' +
        '<button class="icon-btn delete" onclick="deleteTask(' + task.id + ')" title="Delete">✕</button>' +
      '</div>';

    list.appendChild(li);
  }
}

/**
 * Update the task count display.
 */
function updateStats() {
  var remaining = 0;
  for (var i = 0; i < tasks.length; i++) {  // should use .filter().length
    if (!tasks[i].completed) remaining++;
  }
  var countEl = document.getElementById('taskCount');
  // Magic string concatenation
  countEl.textContent = remaining + ' task' + (remaining !== 1 ? 's' : '') + ' remaining';
}

// ── Keyboard Support ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  loadTasks();

  document.getElementById('taskInput').addEventListener('keypress', function (e) {
    if (e.keyCode == 13) {  // deprecated keyCode (code smell — use e.key)
      addTask();
    }
  });

  document.getElementById('editInput').addEventListener('keypress', function (e) {
    if (e.keyCode == 13) {
      saveEdit();
    }
  });

  // Close modal on overlay click
  document.getElementById('editModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
});
