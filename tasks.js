document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const addTaskBtn = document.querySelector('.add-task-btn');
  const modal = document.getElementById('taskModal');
  const modalClose = document.querySelector('.modal-close');
  const taskForm = document.getElementById('taskForm');
  const taskList = document.getElementById('taskList');
  const categories = document.querySelectorAll('.category');
  const toast = document.getElementById('toast');

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let currentFilter = 'all';

  // Generate unique ID
  function generateId() {
    return 'TASK' + Date.now().toString().slice(-6);
  }

  // Show toast notification
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Toggle modal
  function toggleModal() {
    modal.classList.toggle('active');
  }

  // Populate "Assigned To" dropdown with faculty names
  function populateFacultyDropdown() {
    const assignedToSelect = document.getElementById('assignedTo');
    const facultyList = JSON.parse(localStorage.getItem('faculties')) || [];

    assignedToSelect.innerHTML = '<option value="">Select Faculty</option>';
    facultyList.forEach(faculty => {
      const option = document.createElement('option');
      option.value = faculty.name;
      option.textContent = faculty.name;
      assignedToSelect.appendChild(option);
    });
  }

  // Update category counts
  function updateCategoryCounts() {
    const counts = {
      all: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };

    Object.entries(counts).forEach(([category, count]) => {
      const element = document.querySelector(`.category.${category} .count`);
      if (element) element.textContent = count;
    });
  }

  // Filter tasks
  function filterTasks() {
    if (currentFilter === 'all') return tasks;
    return tasks.filter(task => task.status === currentFilter);
  }

  // Format date
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  // Render tasks
  function renderTasks() {
    const filteredTasks = filterTasks();
    taskList.innerHTML = filteredTasks.map(task => `
      <div class="task-item" data-id="${task.id}">
        <div class="task-checkbox ${task.status === 'completed' ? 'checked' : ''}"
             onclick="toggleTaskStatus('${task.id}')"></div>
        <div class="task-content">
          <h3 class="task-title">${task.title}</h3>
          <div class="task-details">
            <span class="task-detail">
              <span class="material-icons-outlined">event</span>
              ${formatDate(task.dueDate)}
            </span>
            <span class="task-detail">
              <span class="material-icons-outlined">person</span>
              ${task.assignedTo}
            </span>
            <span class="priority-badge priority-${task.priority}">
              ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
        </div>
        <div class="task-actions">
          <button class="action-btn edit-btn" onclick="editTask('${task.id}')">
            <span class="material-icons-outlined">edit</span>
          </button>
          <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')">
            <span class="material-icons-outlined">delete</span>
          </button>
        </div>
      </div>
    `).join('');

    updateCategoryCounts();
  }

  // Toggle task status
  window.toggleTaskStatus = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
      showToast(`Task marked as ${task.status}`);
    }
  };

  // Edit task
  window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      document.getElementById('modalTitle').textContent = 'Edit Task';
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskDescription').value = task.description;
      document.getElementById('dueDate').value = task.dueDate;
      document.getElementById('priority').value = task.priority;
      document.getElementById('assignedTo').value = task.assignedTo;
      document.getElementById('status').value = task.status;

      taskForm.dataset.mode = 'edit';
      taskForm.dataset.editId = id;
      populateFacultyDropdown();
      toggleModal();
    }
  };

  // Delete task
  window.deleteTask = function(id) {
    if (confirm('Are you sure you want to delete this task?')) {
      tasks = tasks.filter(t => t.id !== id);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
      showToast('Task deleted successfully');
    }
  };

  // Event Listeners
  addTaskBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add New Task';
    taskForm.reset();
    delete taskForm.dataset.mode;
    delete taskForm.dataset.editId;
    document.getElementById('dueDate').valueAsDate = new Date();
    populateFacultyDropdown();
    toggleModal();
  });

  modalClose.addEventListener('click', toggleModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal();
  });

  categories.forEach(category => {
    category.addEventListener('click', () => {
      categories.forEach(c => c.classList.remove('active'));
      category.classList.add('active');
      currentFilter = category.classList[1];
      renderTasks();
    });
  });

  // Submit task form
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
      title: document.getElementById('taskTitle').value.trim(),
      description: document.getElementById('taskDescription').value.trim(),
      dueDate: document.getElementById('dueDate').value,
      priority: document.getElementById('priority').value,
      assignedTo: document.getElementById('assignedTo').value,
      status: document.getElementById('status').value
    };

    if (taskForm.dataset.mode === 'edit') {
      const editId = taskForm.dataset.editId;
      const index = tasks.findIndex(t => t.id === editId);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...formData };
        showToast('Task updated successfully');
      }
    } else {
      tasks.push({ id: generateId(), ...formData });
      showToast('New task added successfully');
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    toggleModal();
  });

  // Initial render
  populateFacultyDropdown(); // Load dropdown when page loads
  renderTasks();
});
