// ✅ Updated students.js with Faculty Dropdown + Faculty Filter Integration

document.addEventListener('DOMContentLoaded', () => {
  const addStudentBtn = document.querySelector('.add-student-btn');
  const modal = document.querySelector('.modal');
  const modalClose = document.querySelector('.modal-close');
  const studentForm = document.getElementById('studentForm');
  const studentsTableBody = document.querySelector('.students-table tbody');
  const searchInput = document.getElementById('searchInput');
  const courseFilter = document.getElementById('courseFilter');
  const batchFilter = document.getElementById('batchFilter');
  const statusFilter = document.getElementById('statusFilter');
  const courseDropdown = document.getElementById('courseDropdown');
  const facultyDropdown = document.getElementById('facultyDropdown');

  let students = [];

  function loadStudents() {
    const data = localStorage.getItem('students');
    students = data ? JSON.parse(data) : [];

    students = students.map(s => ({
      ...s,
      id: Number(s.id),
      course: s.course?.trim().toLowerCase(),
      batch: s.batch?.trim().toLowerCase(),
      status: s.status?.trim().toLowerCase()
    }));
  }

  function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
  }

  function populateCourseDropdowns(callback) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    courseDropdown.innerHTML = `<option value="">-- Select Course --</option>`;
    courseFilter.innerHTML = `<option value="">All Courses</option>`;

    courses.forEach(course => {
      const value = course.name.trim().toLowerCase();
      const label = course.name;
      const option = `<option value="${value}">${label}</option>`;
      courseDropdown.insertAdjacentHTML('beforeend', option);
      courseFilter.insertAdjacentHTML('beforeend', option);
    });

    if (callback) callback();
  }

  function populateFacultyDropdown() {
    const facultyData = JSON.parse(localStorage.getItem('faculties')) || [];
    facultyDropdown.innerHTML = '';
    facultyData.forEach(faculty => {
      const option = document.createElement('option');
      option.value = faculty.name;
      option.textContent = faculty.name;
      facultyDropdown.appendChild(option);
    });

    // Add Faculty Filter Dropdown
    const filterSection = document.querySelector('.filter-section');
    if (filterSection && !document.getElementById('facultyFilter')) {
      const facultyFilter = document.createElement('select');
      facultyFilter.id = 'facultyFilter';
      facultyFilter.className = 'filter-select';

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'All Faculty';
      facultyFilter.appendChild(defaultOption);

      facultyData.forEach(faculty => {
        const option = document.createElement('option');
        option.value = faculty.name.toLowerCase();
        option.textContent = faculty.name;
        facultyFilter.appendChild(option);
      });

      filterSection.insertBefore(facultyFilter, document.getElementById('searchInput'));

      facultyFilter.addEventListener('change', renderStudents);
    }
  }

  function toggleModal() {
    modal.classList.toggle('active');
  }

  function generateId() {
    return students.length ? Math.max(...students.map(s => Number(s.id))) + 1 : 1;
  }

  function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }

  function filterStudents() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const courseValue = courseFilter.value.trim().toLowerCase();
    const batchValue = batchFilter.value.trim().toLowerCase();
    const statusValue = statusFilter.value.trim().toLowerCase();
    const facultyFilter = document.getElementById('facultyFilter');
    const facultyValue = facultyFilter ? facultyFilter.value.trim().toLowerCase() : '';

    return students.filter(student => {
      const matchesSearch = Object.values(student).some(value =>
        String(value || '').toLowerCase().includes(searchTerm)
      );

      const matchesCourse = !courseValue || student.course === courseValue;
      const matchesBatch = !batchValue || student.batch === batchValue;
      const matchesStatus = !statusValue || student.status === statusValue;
      const matchesFaculty = !facultyValue || (student.faculty || []).some(f => f.toLowerCase() === facultyValue);

      return matchesSearch && matchesCourse && matchesBatch && matchesStatus && matchesFaculty;
    });
  }

  function renderStudents() {
    const filteredStudents = filterStudents();
    studentsTableBody.innerHTML = '';

    if (filteredStudents.length === 0) {
      studentsTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 1rem;">
            No students found.
          </td>
        </tr>
      `;
      updateDashboard();
      return;
    }

    studentsTableBody.innerHTML = filteredStudents.map(student => `
      <tr>
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.phone}</td>
        <td>${capitalize(student.course)}</td>
        <td>${capitalize(student.batch)}</td>
        <td>${student.admissionDate}</td>
        <td>
          <span class="status-badge status-${student.status}">
            ${capitalize(student.status)}
          </span>
        </td>
        <td>
          <div class="student-actions">
            <button class="action-btn edit-btn" data-id="${student.id}">
              <span class="material-icons-outlined">edit</span>
            </button>
            <button class="action-btn delete-btn" data-id="${student.id}">
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editStudent(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteStudent(btn.dataset.id));
    });

    updateDashboard();
  }

  function updateDashboard() {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;

    const dashboardElements = {
      'total-students': totalStudents,
      'active-students': activeStudents
    };

    Object.entries(dashboardElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  function editStudent(id) {
    const student = students.find(s => s.id === Number(id));
    if (student) {
      document.getElementById('studentName').value = student.name;
      document.getElementById('studentEmail').value = student.email;
      document.getElementById('studentPhone').value = student.phone;
      courseDropdown.value = student.course;
      document.getElementById('studentBatch').value = student.batch;
      document.getElementById('joinDate').value = student.admissionDate;
      document.getElementById('studentStatus').value = student.status;

      if (Array.isArray(student.faculty)) {
        Array.from(facultyDropdown.options).forEach(option => {
          option.selected = student.faculty.includes(option.value);
        });
      }

      studentForm.dataset.mode = 'edit';
      studentForm.dataset.editId = student.id;
      toggleModal();
    }
  }

  function deleteStudent(id) {
    const studentId = Number(id);
    const studentExists = students.some(s => Number(s.id) === studentId);
    if (!studentExists) {
      alert("Student not found or already deleted.");
      return;
    }

    if (confirm('Are you sure you want to delete this student?')) {
      students = students.filter(s => Number(s.id) !== studentId);
      saveStudents();
      renderStudents();
    }
  }

  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const phoneInput = document.getElementById('studentPhone').value.trim();
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneInput)) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    const selectedFaculty = Array.from(facultyDropdown.selectedOptions).map(opt => opt.value);

    const formData = {
      name: document.getElementById('studentName').value,
      email: document.getElementById('studentEmail').value,
      phone: phoneInput,
      course: courseDropdown.value.trim().toLowerCase(),
      batch: document.getElementById('studentBatch').value.trim().toLowerCase(),
      admissionDate: document.getElementById('joinDate').value,
      status: document.getElementById('studentStatus').value.trim().toLowerCase(),
      faculty: selectedFaculty
    };

    if (studentForm.dataset.mode === 'edit') {
      const editId = Number(studentForm.dataset.editId);
      const index = students.findIndex(s => Number(s.id) === editId);
      if (index !== -1) {
        students[index] = { id: editId, ...formData };
      }
    } else {
      students.push({ id: generateId(), ...formData });
    }

    saveStudents();

    const toastMsg = studentForm.dataset.mode === 'edit'
      ? `Student "${formData.name}" updated successfully!`
      : `Student "${formData.name}" added successfully!`;

    showToast(toastMsg);

    renderStudents();
    studentForm.reset();
    toggleModal();
  });

  // Event Listeners
  addStudentBtn.addEventListener('click', () => {
    studentForm.reset();
    delete studentForm.dataset.mode;
    delete studentForm.dataset.editId;
    toggleModal();
  });

  modalClose.addEventListener('click', toggleModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal();
  });

  searchInput.addEventListener('input', renderStudents);
  courseFilter.addEventListener('change', renderStudents);
  batchFilter.addEventListener('change', renderStudents);
  statusFilter.addEventListener('change', renderStudents);

  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    courseFilter.value = '';
    batchFilter.value = '';
    statusFilter.value = '';
    searchInput.value = '';
    const facultyFilter = document.getElementById('facultyFilter');
    if (facultyFilter) facultyFilter.value = '';
    renderStudents();
  });

  // Init
  loadStudents();
  populateCourseDropdowns(() => {
    renderStudents();
  });
  populateFacultyDropdown();
});

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
