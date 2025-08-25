document.addEventListener('DOMContentLoaded', () => {
  const addCourseBtn = document.querySelector('.add-course-btn');
  const addCourseFormContainer = document.querySelector('.add-course-form-container');
  const cancelCourseBtn = document.querySelector('.cancel-course-btn');
  const saveCourseBtn = document.querySelector('.save-course-btn');
  const coursesGrid = document.querySelector('.courses-grid');
  const courseForm = document.querySelector('.add-course-form');

  let courses = JSON.parse(localStorage.getItem('courses')) || [];
  let editingIndex = null;

  function getStudentCountByCourse(courseName) {
    const students = JSON.parse(localStorage.getItem('students')) || [];
    return students.filter(student => {
      return student.course?.trim().toLowerCase() === courseName.trim().toLowerCase();
    }).length;
  }

  function saveToLocalStorage() {
    localStorage.setItem('courses', JSON.stringify(courses));
    const courseNames = courses.map(c => c.name);
    localStorage.setItem('courseNames', JSON.stringify(courseNames));
  }

  function renderCourses() {
    coursesGrid.innerHTML = '';
    courses.forEach((course, index) => {
      const enrolledCount = getStudentCountByCourse(course.name);
      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `
        <div class="course-header">
          <h3>${course.name}</h3>
          <span class="badge ${course.status.toLowerCase()}">${course.status}</span>
        </div>
        <div class="course-details">
          <p><span class="material-icons-outlined">schedule</span> Duration: ${course.duration}</p>
          <p><span class="material-icons-outlined">groups</span> Students: ${enrolledCount}</p>
          <p><span class="material-icons-outlined">payments</span> Fee: ₹${course.fee}</p>
        </div>
        <div class="course-actions">
          <button class="edit-btn" data-index="${index}"><span class="material-icons-outlined">edit</span></button>
          <button class="delete-btn" data-index="${index}"><span class="material-icons-outlined">delete</span></button>
        </div>
      `;
      coursesGrid.appendChild(card);
    });
    attachEditDeleteEvents();
  }

  function attachEditDeleteEvents() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = () => {
        editingIndex = btn.dataset.index;
        const course = courses[editingIndex];

        document.getElementById('course-name').value = course.name;
        document.getElementById('course-duration').value = course.duration;
        document.getElementById('course-fee').value = course.fee;
        document.getElementById('course-status').value = course.status;

        addCourseFormContainer.style.display = 'block';
      };
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = () => {
        const index = btn.dataset.index;
        const courseName = courses[index].name;
        if (confirm(`Are you sure you want to delete ${courseName}?`)) {
          courses.splice(index, 1);
          saveToLocalStorage();
          renderCourses();
        }
      };
    });
  }

  if (addCourseBtn) {
    addCourseBtn.addEventListener('click', () => {
      courseForm.reset();
      editingIndex = null;
      addCourseFormContainer.style.display = 'block';
    });
  }

  if (cancelCourseBtn) {
    cancelCourseBtn.addEventListener('click', () => {
      addCourseFormContainer.style.display = 'none';
    });
  }

  if (saveCourseBtn) {
    saveCourseBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const name = document.getElementById('course-name').value.trim();
      const duration = document.getElementById('course-duration').value.trim();
      const fee = document.getElementById('course-fee').value.trim();
      const status = document.getElementById('course-status').value;

      if (!name || !duration || !fee) {
        alert('Please fill all fields!');
        return;
      }

      const courseData = { name, duration, fee, status };

      if (editingIndex !== null) {
        courses[editingIndex] = courseData;
      } else {
        courses.push(courseData);
      }

      saveToLocalStorage();
      renderCourses();
      courseForm.reset();
      addCourseFormContainer.style.display = 'none';
    });
  }

  saveToLocalStorage();
renderCourses();
courseForm.reset();
addCourseFormContainer.style.display = 'none';

// Refresh course popularity chart if available
if (typeof renderCoursePopularityChart === 'function') {
  renderCoursePopularityChart();
}

  renderCourses(); // Initial render
});

window.addEventListener('storage', (e) => {
  if (e.key === 'students' || e.key === 'courses') {
    if (typeof renderCoursePopularityChart === 'function') {
      renderCoursePopularityChart();
    }
  }
});

