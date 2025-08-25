// ✅ Enhanced chart.js with reliable monthly, quarterly, yearly filters for revenue/expenses

document.addEventListener('DOMContentLoaded', () => {
  renderRevenueChart('monthly');
  renderEnrollmentChart();
  renderCoursePopularityChart();

  const timeframeSelect = document.getElementById('revenue-chart-timeframe');
  if (timeframeSelect) {
    timeframeSelect.addEventListener('change', e => {
      renderRevenueChart(e.target.value);
    });
  }
});

let revenueChartInstance = null;

function renderRevenueChart(timeframe = 'monthly') {
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  const incomeMap = {};
  const expenseMap = {};

  transactions.forEach(tx => {
    if (!tx.date || tx.status !== 'Completed') return;
    const date = new Date(tx.date);
    if (isNaN(date)) return;

    let key;
    if (timeframe === 'monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (timeframe === 'quarterly') {
      const q = Math.floor(date.getMonth() / 3) + 1;
      key = `${date.getFullYear()}-Q${q}`;
    } else {
      key = `${date.getFullYear()}`;
    }

    if (tx.type === 'Income') {
      incomeMap[key] = (incomeMap[key] || 0) + Number(tx.amount || 0);
    } else if (tx.type === 'Expense') {
      expenseMap[key] = (expenseMap[key] || 0) + Number(tx.amount || 0);
    }
  });

  const allKeys = Array.from(new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)]));

  const sortedKeys = allKeys.sort((a, b) => {
    if (timeframe === 'monthly') {
      return new Date(a + '-01') - new Date(b + '-01');
    } else if (timeframe === 'quarterly') {
      const [ya, qa] = a.split('-Q').map(Number);
      const [yb, qb] = b.split('-Q').map(Number);
      return ya !== yb ? ya - yb : qa - qb;
    } else {
      return Number(a) - Number(b);
    }
  });

  const incomeData = sortedKeys.map(k => incomeMap[k] || 0);
  const expenseData = sortedKeys.map(k => expenseMap[k] || 0);

  const canvas = document.getElementById('revenue-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (revenueChartInstance) revenueChartInstance.destroy();

  revenueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedKeys,
      datasets: [
        {
          label: 'Revenue',
          data: incomeData,
          borderColor: '#4CAF50',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#F44336',
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `₹${value.toLocaleString('en-IN')}`
          }
        }
      }
    }
  });
}

function renderEnrollmentChart() {
  const students = JSON.parse(localStorage.getItem('students')) || [];
  const monthCounts = new Array(12).fill(0);

  students.forEach(s => {
    if (s.admissionDate) {
      const month = new Date(s.admissionDate).getMonth();
      if (!isNaN(month)) monthCounts[month]++;
    }
  });

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  new Chart(document.getElementById('enrollment-chart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Enrollments',
        data: monthCounts,
        backgroundColor: '#2196F3'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function renderCoursePopularityChart() {
  const chartCanvas = document.getElementById('course-popularity-chart');
  if (!chartCanvas) return;

  const chartContainer = chartCanvas.parentElement;
  const students = JSON.parse(localStorage.getItem('students')) || [];
  const courses = JSON.parse(localStorage.getItem('courses')) || [];

  const validCourseNames = new Set(courses.map(c => c.name.trim().toLowerCase()));
  const courseCounts = {};

  students.forEach(s => {
    const courseName = s.course?.trim().toLowerCase();
    if (courseName && validCourseNames.has(courseName)) {
      courseCounts[courseName] = (courseCounts[courseName] || 0) + 1;
    }
  });

  const labels = Object.keys(courseCounts);
  const values = Object.values(courseCounts);

  // Clear previous content
  chartContainer.innerHTML = '<canvas id="course-popularity-chart"></canvas>';
  const canvas = document.getElementById('course-popularity-chart');

  if (labels.length === 0) {
    chartContainer.innerHTML = `<p style="text-align:center;">No course data available.</p>`;
    return;
  }

  const colors = labels.map(() =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
  );

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const val = context.parsed;
              const pct = ((val / total) * 100).toFixed(1);
              return `${context.label}: ${val} student(s) (${pct}%)`;
            }
          }
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Auto-refresh chart when localStorage changes
window.addEventListener('storage', (e) => {
  if (e.key === 'students' || e.key === 'courses') {
    renderCoursePopularityChart();
  }
});
