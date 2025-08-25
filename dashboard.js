// ✅ Final dashboard.js with separate badges, sound, friendly labels, and Today/Yesterday/Tomorrow filter

document.addEventListener('DOMContentLoaded', () => {
  updateDashboardStats();
  updateNotificationBadge();
  updatePendingTasksDashboard();
  loadNotificationContent();
});

function updateDashboardStats() {
  const students = JSON.parse(localStorage.getItem('students')) || [];
  const enquiries = JSON.parse(localStorage.getItem('enquiries')) || [];
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status?.toLowerCase() === 'active').length;
  const newEnquiries = enquiries.length;
  const activeCourses = courses.length;
  const monthlyRevenue = transactions
    .filter(tx => tx.type === 'Income' && tx.status === 'Completed')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  document.getElementById('total-students').textContent = totalStudents;
  document.getElementById('active-students').textContent = activeStudents;
  document.getElementById('new-enquiries').textContent = newEnquiries;
  document.getElementById('monthly-revenue').textContent = `₹${monthlyRevenue.toLocaleString('en-IN')}`;
  document.getElementById('active-courses').textContent = activeCourses;
}

function updateNotificationBadge() {
  const enquiries = JSON.parse(localStorage.getItem('enquiries')) || [];

  let taskCount = 0;
  let noteCount = 0;
  enquiries.forEach(e => {
    taskCount += (e.tasks || []).length;
    noteCount += (e.notes || []).length;
  });

  const total = taskCount + noteCount;

  const badge = document.getElementById("notificationBadge");
  const taskBadge = document.getElementById("notifTaskCount");
  const noteBadge = document.getElementById("notifNoteCount");

  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? "inline-block" : "none";
    badge.classList.add("pulse");
    setTimeout(() => badge.classList.remove("pulse"), 1000);
  }
  if (taskBadge) {
    taskBadge.textContent = taskCount;
    taskBadge.style.display = taskCount > 0 ? "inline-block" : "none";
  }
  if (noteBadge) {
    noteBadge.textContent = noteCount;
    noteBadge.style.display = noteCount > 0 ? "inline-block" : "none";
  }

  if (total > 0) {
    const audio = new Audio("notification.mp3");
    audio.play().catch(() => {});
  }
}

function updatePendingTasksDashboard() {
  const taskListContainer = document.querySelector('.pending-tasks .task-list');
  if (!taskListContainer) return;

  const enquiries = JSON.parse(localStorage.getItem('enquiries')) || [];
  const allTasks = enquiries.flatMap(e => e.tasks?.map(t => ({ ...t, enquiryId: e.id, enquiryName: e.name })) || []);
  const now = new Date();
  const pendingTasks = allTasks.filter(t => new Date(t.time) >= now);

  taskListContainer.innerHTML = pendingTasks.length === 0
    ? '<p>No upcoming tasks.</p>'
    : '';

  pendingTasks.slice(0, 5).forEach((task) => {
    const due = new Date(task.time);
    const today = new Date();
    const dueText =
      due.toDateString() === today.toDateString() ? 'Due Today' :
      due > today ? `Due ${due.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` :
      'Overdue';

    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
      <label>${task.text}</label>
      <span class="task-due">${dueText}</span>
    `;
    div.onclick = () => {
      sessionStorage.setItem('inlineProfileToOpen', task.enquiryId);
      sessionStorage.setItem('inlineProfileName', task.enquiryName);
      window.location.href = 'enquiries.html';
    };
    taskListContainer.appendChild(div);
  });
}

function loadNotificationContent() {
  const enquiries = JSON.parse(localStorage.getItem('enquiries')) || [];
  const tasksBox = document.getElementById('notifTasks');
  const notesBox = document.getElementById('notifNotes');
  const taskLabel = document.getElementById('notifTaskCountLabel');
  const noteLabel = document.getElementById('notifNoteCountLabel');
  if (!tasksBox || !notesBox) return;

  let taskCount = 0;
  let noteCount = 0;

  tasksBox.innerHTML = '';
  notesBox.innerHTML = '';

  const now = new Date();
  const today = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();

  const getLabel = (d) => {
    if (d.getDate() === today && d.getMonth() === month && d.getFullYear() === year) return 'Today';
    const yesterday = new Date(now); yesterday.setDate(today - 1);
    const tomorrow = new Date(now); tomorrow.setDate(today + 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return null;
  };

  enquiries.forEach(e => {
    (e.tasks || []).forEach(t => {
      const created = new Date(t.time);
      const label = getLabel(created);
      if (!label) return;

      const div = document.createElement('div');
      div.className = 'notif-item';
      div.innerHTML = `<b>${t.text}</b><small>${t.admin} • ${label}</small>`;
      div.onclick = () => {
        sessionStorage.setItem('inlineProfileToOpen', e.id);
        sessionStorage.setItem('inlineProfileName', e.name);
        window.location.href = 'enquiries.html';
      };
      tasksBox.appendChild(div);
      taskCount++;
    });

    (e.notes || []).forEach(n => {
      const created = new Date(n.time);
      const label = getLabel(created);
      if (!label) return;

      const div = document.createElement('div');
      div.className = 'notif-item';
      div.innerHTML = `<b>${n.text}</b><small>${n.admin} • ${label}</small>`;
      div.onclick = () => {
        sessionStorage.setItem('inlineProfileToOpen', e.id);
        sessionStorage.setItem('inlineProfileName', e.name);
        window.location.href = 'enquiries.html';
      };
      notesBox.appendChild(div);
      noteCount++;
    });
  });

  if (taskLabel) taskLabel.textContent = taskCount;
  if (noteLabel) noteLabel.textContent = noteCount;
}

// Close dropdown if clicked outside
window.addEventListener('click', (event) => {
  const bell = document.getElementById('notifBell');
  const dropdown = document.getElementById('notificationDropdown');
  if (dropdown && !bell.contains(event.target)) {
    dropdown.classList.add('hidden');
  }
});

// Toggle notification dropdown
const notifBell = document.getElementById('notifBell');
if (notifBell) {
  notifBell.addEventListener('click', () => {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
  });
}

// Sync in real-time
window.addEventListener('storage', (e) => {
  if (e.key === 'enquiries') {
    updatePendingTasksDashboard();
    loadNotificationContent();
    updateNotificationBadge();
  }
});

window.addEventListener('storage', (e) => {
  if (e.key === 'students' || e.key === 'courses') {
    if (typeof renderCoursePopularityChart === 'function') {
      renderCoursePopularityChart();
    }
  }
});
