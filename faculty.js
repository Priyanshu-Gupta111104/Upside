document.addEventListener('DOMContentLoaded', () => {
  const facultyGrid = document.querySelector('.faculty-grid');
  const addFacultyBtn = document.querySelector('.add-faculty-btn');
  const modal = document.getElementById('facultyModal');
  const closeModal = document.getElementById('closeModal');
  const facultyForm = document.getElementById('facultyForm');

  const nameInput = document.getElementById('facultyName');
  const designationInput = document.getElementById('facultyDesignation');
  const studentsInput = document.getElementById('facultyStudents');
  const coursesInput = document.getElementById('facultyCourses');
  const ratingInput = document.getElementById('facultyRating');

  let faculties = JSON.parse(localStorage.getItem('faculties')) || [];
  let editingId = null;

  function saveToLocalStorage() {
    localStorage.setItem('faculties', JSON.stringify(faculties));
  }

  function generateId() {
    return 'FAC' + Date.now().toString().slice(-6);
  }

  function renderFaculties() {
    facultyGrid.innerHTML = '';
    faculties.forEach(faculty => {
      const card = document.createElement('div');
      card.className = 'faculty-card';
      const initials = faculty.name.split(" ").map(n => n[0]).join("").toUpperCase();
      card.innerHTML = `
        <div class="faculty-avatar">${initials}</div>
        <div class="faculty-info">
          <h3>${faculty.name}</h3>
          <p class="designation">${faculty.designation}</p>
          <div class="stats">
            <div class="stat"><span class="label">Students</span><span class="value">${faculty.students}</span></div>
            <div class="stat"><span class="label">Courses</span><span class="value">${faculty.courses}</span></div>
            <div class="stat"><span class="label">Rating</span><span class="value">${faculty.rating}</span></div>
          </div>
        </div>
        <div class="faculty-actions">
          <button class="view-btn"><span class="material-icons-outlined">visibility</span></button>
          <button class="edit-btn"><span class="material-icons-outlined">edit</span></button>
          <button class="delete-btn"><span class="material-icons-outlined">delete</span></button>
        </div>
      `;
      addCardListeners(card, faculty.id);
      facultyGrid.appendChild(card);
    });
  }

  function addCardListeners(card, id) {
    // View
    card.querySelector('.view-btn').addEventListener('click', () => {
      const faculty = faculties.find(f => f.id === id);
      alert(`Viewing profile: ${faculty.name}`);
    });

    // Edit
    card.querySelector('.edit-btn').addEventListener('click', () => {
      const faculty = faculties.find(f => f.id === id);
      if (!faculty) return;

      editingId = id;
      nameInput.value = faculty.name;
      designationInput.value = faculty.designation;
      studentsInput.value = faculty.students;
      coursesInput.value = faculty.courses;
      ratingInput.value = faculty.rating;

      modal.style.display = 'flex';
    });

    // Delete
    card.querySelector('.delete-btn').addEventListener('click', () => {
      const faculty = faculties.find(f => f.id === id);
      if (confirm(`Are you sure you want to delete ${faculty.name}?`)) {
        faculties = faculties.filter(f => f.id !== id);
        saveToLocalStorage();
        renderFaculties();
        alert(`Deleted ${faculty.name}`);
      }
    });
  }

  addFacultyBtn.addEventListener('click', () => {
    editingId = null;
    facultyForm.reset();
    modal.style.display = 'flex';
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    editingId = null;
    facultyForm.reset();
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      editingId = null;
      facultyForm.reset();
    }
  });

  facultyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newFaculty = {
      id: editingId || generateId(),
      name: nameInput.value.trim(),
      designation: designationInput.value.trim(),
      students: studentsInput.value.trim(),
      courses: coursesInput.value.trim(),
      rating: ratingInput.value.trim()
    };

    if (editingId) {
      const index = faculties.findIndex(f => f.id === editingId);
      if (index !== -1) faculties[index] = newFaculty;
    } else {
      faculties.push(newFaculty);
    }

    saveToLocalStorage();
    renderFaculties();
    modal.style.display = 'none';
    facultyForm.reset();
    editingId = null;
  });

  renderFaculties();
});
