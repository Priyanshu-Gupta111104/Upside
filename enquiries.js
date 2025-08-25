// enquiries.js – fully working version with inline profile buttons fixed
// ✅ Fully Fixed and Optimized enquiries.js (Unified Profile, Notes, Tasks, Back Button)

document.addEventListener('DOMContentLoaded', () => {
  const addEnquiryBtn = document.querySelector('.add-enquiry-btn');
  const modal = document.getElementById('enquiryModal');
  const modalClose = document.querySelector('.modal-close');
  const enquiryForm = document.getElementById('enquiryForm');
  const enquiriesTableBody = document.getElementById('enquiriesTableBody');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const adminFilter = document.getElementById('adminFilter');
  const courseFilter = document.getElementById('courseFilter');
  const toast = document.getElementById('toast');

  let enquiries = JSON.parse(localStorage.getItem('enquiries')) || [];

  function populateDropdowns() {
    const courseList = JSON.parse(localStorage.getItem('courseNames')) || [];
    const courseSelect = document.getElementById('course');
    courseFilter.innerHTML = '<option value="">All Courses</option>';
    courseSelect.innerHTML = '<option value="">Select Course</option>';
    courseList.forEach(name => {
      courseFilter.innerHTML += `<option value="${name}">${name}</option>`;
      courseSelect.innerHTML += `<option value="${name}">${name}</option>`;
    });

    const facultyList = JSON.parse(localStorage.getItem('faculties')) || [];
    const assignedAdminSelect = document.getElementById('assignedAdmin');
    adminFilter.innerHTML = '<option value="">All Admins</option>';
    assignedAdminSelect.innerHTML = '<option value="">Select Admin</option>';
    facultyList.forEach(fac => {
      adminFilter.innerHTML += `<option value="${fac.name}">${fac.name}</option>`;
      assignedAdminSelect.innerHTML += `<option value="${fac.name}">${fac.name}</option>`;
    });
  }

  function toggleModal() {
    modal.classList.toggle('active');
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function generateId() {
    const used = enquiries.map(e => parseInt(e.id.replace('ENQ', '')));
    let next = 1;
    while (used.includes(next)) next++;
    return 'ENQ' + next.toString().padStart(3, '0');
  }

  function updateSummary() {
    document.getElementById('totalEnquiries').textContent = enquiries.length;
    document.getElementById('openEnquiries').textContent = enquiries.filter(e => e.status === 'Open').length;
  }

  function filterEnquiries() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const adminValue = adminFilter.value;
    const courseValue = courseFilter.value;

    return enquiries.filter(enquiry => {
      const matchesSearch = Object.values(enquiry).some(value => String(value).toLowerCase().includes(searchTerm));
      const matchesStatus = !statusValue || enquiry.status === statusValue;
      const matchesAdmin = !adminValue || enquiry.assignedAdmin === adminValue;
      const matchesCourse = !courseValue || enquiry.course === courseValue;
      return matchesSearch && matchesStatus && matchesAdmin && matchesCourse;
    });
  }

  function renderEnquiries() {
    const filtered = filterEnquiries();
    enquiriesTableBody.innerHTML = filtered.map(enquiry => `
      <tr>
        <td>${enquiry.id}</td>
        <td>${enquiry.name}</td>
        <td>${enquiry.email}</td>
        <td>${enquiry.phone}</td>
        <td>${enquiry.course}</td>
        <td>${enquiry.enquiryDate}</td>
        <td><span class="status-badge ${enquiry.status.toLowerCase()}">${enquiry.status}</span></td>
        <td>${enquiry.assignedAdmin}</td>
        <td>
          <button class="action-btn edit-btn" data-id="${enquiry.id}"><span class="material-icons-outlined">edit</span></button>
          <button class="action-btn view-btn" data-id="${enquiry.id}"><span class="material-icons-outlined">visibility</span></button>
          <button class="action-btn delete-btn" data-id="${enquiry.id}"><span class="material-icons-outlined">delete</span></button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = () => editEnquiry(btn.dataset.id));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = () => deleteEnquiry(btn.dataset.id));
    document.querySelectorAll('.view-btn').forEach(btn => btn.onclick = () => openProfileInline(btn.dataset.id));

    updateSummary();
  }

  function editEnquiry(id) {
    const enquiry = enquiries.find(e => e.id === id);
    if (!enquiry) return;
    document.getElementById('modalTitle').textContent = 'Edit Enquiry';
    enquiryForm.dataset.mode = 'edit';
    enquiryForm.dataset.editId = id;

    document.getElementById('fullName').value = enquiry.name;
    document.getElementById('email').value = enquiry.email;
    document.getElementById('phone').value = enquiry.phone;
    document.getElementById('course').value = enquiry.course;
    document.getElementById('enquiryDate').value = enquiry.enquiryDate;
    document.getElementById('status').value = enquiry.status;
    document.getElementById('assignedAdmin').value = enquiry.assignedAdmin;

    toggleModal();
  }

  function deleteEnquiry(id) {
    if (!confirm("Are you sure?")) return;
    const history = JSON.parse(localStorage.getItem("deletedEnquiries")) || [];
    const deleted = enquiries.find(e => e.id === id);
    history.push(deleted);
    localStorage.setItem("deletedEnquiries", JSON.stringify(history));
    enquiries = enquiries.filter(e => e.id !== id);
    localStorage.setItem("enquiries", JSON.stringify(enquiries));
    renderEnquiries();
    showToast("Enquiry deleted");
  }

  addEnquiryBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add New Enquiry';
    enquiryForm.reset();
    delete enquiryForm.dataset.mode;
    delete enquiryForm.dataset.editId;
    document.getElementById('enquiryDate').valueAsDate = new Date();
    toggleModal();
  });

  modalClose.addEventListener('click', toggleModal);
  modal.addEventListener('click', e => { if (e.target === modal) toggleModal(); });

  enquiryForm.addEventListener('submit', e => {
    e.preventDefault();
    const phone = document.getElementById('phone').value.trim();
    if (!/^[0-9]{10}$/.test(phone)) return showToast('Phone must be 10 digits');

    const formData = {
      name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone,
      course: document.getElementById('course').value,
      enquiryDate: document.getElementById('enquiryDate').value,
      status: document.getElementById('status').value,
      assignedAdmin: document.getElementById('assignedAdmin').value,
      gender: '', dob: '', address: '', guardianName: '', guardianPhone: '', guardianEmail: '',
      notes: [], tasks: [], activityLog: []
    };

    if (enquiryForm.dataset.mode === 'edit') {
      const index = enquiries.findIndex(e => e.id === enquiryForm.dataset.editId);
      if (index !== -1) enquiries[index] = { ...enquiries[index], ...formData };
      showToast("Enquiry updated");
    } else {
      enquiries.push({ id: generateId(), ...formData });
      showToast("Enquiry added");
    }

    localStorage.setItem('enquiries', JSON.stringify(enquiries));
    renderEnquiries();
    toggleModal();
  });

  searchInput.addEventListener('input', renderEnquiries);
  statusFilter.addEventListener('change', renderEnquiries);
  adminFilter.addEventListener('change', renderEnquiries);
  courseFilter.addEventListener('change', renderEnquiries);
  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    searchInput.value = statusFilter.value = adminFilter.value = courseFilter.value = '';
    renderEnquiries();
  });

  populateDropdowns();
  renderEnquiries();

  // ✅ Auto-open profile from notification (tasks + notes)
  const inlineId = sessionStorage.getItem('inlineProfileToOpen');
  const inlineName = sessionStorage.getItem('inlineProfileName');
  if (inlineId) {
    sessionStorage.removeItem('inlineProfileToOpen');
    sessionStorage.removeItem('inlineProfileName');
    showToast(`🔍 Opening profile for ${inlineName || inlineId}...`);
    setTimeout(() => openProfileInline(inlineId), 0);
  }
});
// Function to go back to enquiries section from profile view
// ✅ This function hides the profile view and shows the enquiries section again
window.goBackToEnquiries = function() {
  document.getElementById("embeddedProfile").style.display = "none";
  document.getElementById("enquiriesSection").style.display = "block";
  document.getElementById("embeddedProfile").innerHTML = ""; // ✅ This clears the old profile
}
// ✅ Fully Fixed and Optimized enquiries.js (Unified Profile, Notes, Tasks, Back Button)

// ... all previous DOMContentLoaded code remains unchanged ...

// 🔄 Inline Profile Renderer with proper syncing
window.openProfileInline = function(enquiryId) {
  const enquiries = JSON.parse(localStorage.getItem("enquiries")) || [];
  const lead = enquiries.find(e => e.id === enquiryId);
  if (!lead) return alert("Profile not found");

  const container = document.getElementById("embeddedProfile");
  container.style.display = "flex";
  document.getElementById("enquiriesSection").style.display = "none";

  function pushActivity(text, admin) {
    lead.activityLog = lead.activityLog || [];
    lead.activityLog.unshift(`${admin} - ${text} - ${new Date().toLocaleString()}`);
  }

  const getAdmins = () => {
    const list = JSON.parse(localStorage.getItem('faculties')) || [];
    return list.map(f => `<option value="${f.name}">${f.name}</option>`).join('');
  };

  const renderNotes = () => {
    document.getElementById('notesList').innerHTML = (lead.notes || []).map((n, i) => `
      <li><b>${n.text}</b><br/><small>${n.admin} - ${n.time}</small>
      <button onclick="editNoteInline(${i})">✏️</button>
      <button onclick="deleteNoteInline(${i})">🗑️</button></li>
    `).join('');
  };

  const renderTasks = () => {
    document.getElementById('tasksList').innerHTML = (lead.tasks || []).map((t, i) => `
      <li><b>${t.text}</b><br/><small>${t.admin} - ${new Date(t.time).toLocaleString()}</small>
      <button onclick="editTaskInline(${i})">✏️</button>
      <button onclick="deleteTaskInline(${i})">🗑️</button></li>
    `).join('');
  };

  const renderActivity = () => {
    document.getElementById('activityLog').innerHTML = (lead.activityLog || []).map((a, i) => `
      <li>
        ${a}
        <button onclick="deleteActivityLog(${i})" style="margin-left: 10px;">🗑️</button>
      </li>
    `).join('');
  };

  const sync = () => {
    localStorage.setItem("enquiries", JSON.stringify(enquiries));
    renderNotes();
    renderTasks();
    renderActivity();
    renderEnquiries();
  };

  container.innerHTML = `
    <div class="left-column">
      <button onclick="goBackToEnquiries()">← Back</button>
      <h2>Personal Details</h2>
      <input id="profileName" value="${lead.name}" placeholder="Name" />
      <input id="profilePhone" value="${lead.phone}" placeholder="Phone" />
      <input id="profileEmail" value="${lead.email}" placeholder="Email" />
      <input id="profileGender" value="${lead.gender || ''}" placeholder="Gender" />
      <input id="profileDob" type="date" value="${lead.dob || ''}" />
      <textarea id="profileAddress" placeholder="Address">${lead.address || ''}</textarea>
      <h2>Guardian</h2>
      <input id="guardianName" value="${lead.guardianName || ''}" placeholder="Guardian Name" />
      <input id="guardianPhone" value="${lead.guardianPhone || ''}" placeholder="Guardian Phone" />
      <input id="guardianEmail" value="${lead.guardianEmail || ''}" placeholder="Guardian Email" />
      <button id="saveProfile">Save Profile</button>
      <h2>Activity Log 
        <button onclick="clearActivityLog()" style="float: right; font-size: 14px;">🗑️ Clear All</button>
      </h2>
      <ul id="activityLog"></ul>
    </div>
    <div class="right-column">
      <section class="card">
        <h3>Add Note</h3>
        <textarea id="newNote"></textarea>
        <select id="noteAdmin">${getAdmins()}</select>
        <button id="saveNote">Save Note</button>
        <ul id="notesList"></ul>
      </section>
      <section class="card">
        <h3>Add Task</h3>
        <input id="newTask" />
        <input id="taskDateTime" type="datetime-local" />
        <select id="taskAdmin">${getAdmins()}</select>
        <button id="saveTask">Save Task</button>
        <ul id="tasksList"></ul>
      </section>
    </div>`;

  document.getElementById("saveProfile").onclick = () => {
    lead.name = document.getElementById("profileName").value;
    lead.phone = document.getElementById("profilePhone").value;
    lead.email = document.getElementById("profileEmail").value;
    lead.gender = document.getElementById("profileGender").value;
    lead.dob = document.getElementById("profileDob").value;
    lead.address = document.getElementById("profileAddress").value;
    lead.guardianName = document.getElementById("guardianName").value;
    lead.guardianPhone = document.getElementById("guardianPhone").value;
    lead.guardianEmail = document.getElementById("guardianEmail").value;
    pushActivity("Updated profile", "Admin");
    sync();
    showToast("Profile updated");
  };

  document.getElementById("saveNote").onclick = () => {
    const text = document.getElementById("newNote").value.trim();
    const admin = document.getElementById("noteAdmin").value;
    if (!text || !admin) return;
    lead.notes = lead.notes || [];
    lead.notes.push({ text, admin, time: new Date().toISOString() });

    document.getElementById("newNote").value = '';
    pushActivity(`Added note: \"${text}\"`, admin);
    sync();
  };

  document.getElementById("saveTask").onclick = () => {
    const text = document.getElementById("newTask").value.trim();
    const time = document.getElementById("taskDateTime").value;
    const admin = document.getElementById("taskAdmin").value;
    if (!text || !time || !admin) return;
    lead.tasks = lead.tasks || [];
    lead.tasks.push({ text, time, admin });
    document.getElementById("newTask").value = '';
    document.getElementById("taskDateTime").value = '';
    pushActivity(`Assigned task: \"${text}\"`, admin);
    sync();
  };

  window.editNoteInline = i => {
    const updated = prompt("Edit note:", lead.notes[i].text);
    if (updated) {
      lead.notes[i].text = updated;
      pushActivity("Edited note", lead.notes[i].admin);
      sync();
    }
  };

  window.deleteNoteInline = i => {
    if (confirm("Delete this note?")) {
      const admin = lead.notes[i].admin;
      lead.notes.splice(i, 1);
      pushActivity("Deleted note", admin);
      sync();
    }
  };

  window.editTaskInline = i => {
    const updated = prompt("Edit task:", lead.tasks[i].text);
    if (updated) {
      lead.tasks[i].text = updated;
      pushActivity("Edited task", lead.tasks[i].admin);
      sync();
    }
  };

  window.deleteTaskInline = i => {
    if (confirm("Delete this task?")) {
      const admin = lead.tasks[i].admin;
      lead.tasks.splice(i, 1);
      pushActivity("Deleted task", admin);
      sync();
    }
  };

  // 👇 These were added for activity log deletion
  window.deleteActivityLog = (index) => {
    if (confirm("Delete this activity log entry?")) {
      lead.activityLog.splice(index, 1);
      sync();
      showToast("Activity log entry deleted");
    }
  };

  window.clearActivityLog = () => {
    if (confirm("Clear entire activity log?")) {
      lead.activityLog = [];
      sync();
      showToast("Activity log cleared");
    }
  };

  sync();
};


  window.deleteActivityLog = (index) => {
    if (confirm("Delete this activity log entry?")) {
      lead.activityLog.splice(index, 1);
      sync();
      showToast("Activity log entry deleted");
    }
  };

  window.clearActivityLog = () => {
    if (confirm("Clear entire activity log?")) {
      lead.activityLog = [];
      sync();
      showToast("Activity log cleared");
    }
  };
