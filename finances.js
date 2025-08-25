let revenueExpenseChart, courseRevenueChart, expenseBreakdownChart;
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editingIndex = null;
const perPage = 5;
let currentPage = 1;

// DOM elements
const transactionModal = document.getElementById('transactionModalOverlay');
const modalTitle = document.getElementById('modalTitle');
const transactionForm = document.getElementById('transactionForm');
const descriptionInput = document.getElementById('description');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const statusInput = document.getElementById('status');
const closeModalBtn = document.getElementById('closeModalBtn');
const addTransactionBtn = document.querySelector('.primary-btn');
const tableBody = document.querySelector('tbody');
const financeCards = {
  revenue: document.querySelector('.revenue .stat-value'),
  expenses: document.querySelector('.expenses .stat-value'),
  profit: document.querySelector('.profit .stat-value'),
  pending: document.querySelector('.pending .stat-value')
};

// Format ₹ with commas
function formatCurrency(num) {
  return '₹' + num.toLocaleString('en-IN');
}

// Show modal
function openModal(isEdit = false, index = null) {
  transactionModal.classList.add('active');
  transactionForm.reset();
  editingIndex = null;

  if (isEdit) {
    modalTitle.textContent = 'Edit Transaction';
    const tx = transactions[index];
    descriptionInput.value = tx.description;
    categoryInput.value = tx.category;
    amountInput.value = tx.amount;
    typeInput.value = tx.type;
    statusInput.value = tx.status;
    editingIndex = index;
  } else {
    modalTitle.textContent = 'Add Transaction';
  }
}

// Close modal
closeModalBtn.addEventListener('click', () => {
  transactionModal.classList.remove('active');
});

// Submit transaction
transactionForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newTx = {
    id: editingIndex !== null ? transactions[editingIndex].id : 'TRX' + String(Date.now()).slice(-5),
    date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    description: descriptionInput.value,
    category: categoryInput.value,
    amount: parseFloat(amountInput.value),
    type: typeInput.value,
    status: statusInput.value
  };

  if (editingIndex !== null) {
    transactions[editingIndex] = newTx;
  } else {
    transactions.unshift(newTx);
  }

  localStorage.setItem('transactions', JSON.stringify(transactions));
  transactionModal.classList.remove('active');
  renderTransactions();
  updateFinanceCards();
  renderRevenueExpenseChart();
  renderCourseRevenueChart();
  renderExpenseBreakdownChart();
});

// View/Edit/Delete actions
function handleAction(action, index) {
  const tx = transactions[index];
  switch (action) {
    case 'visibility':
      alert(`Viewing: ${tx.description} (${tx.id})`);
      break;
    case 'edit':
      openModal(true, index);
      break;
    case 'delete':
      if (confirm(`Delete transaction: ${tx.description}?`)) {
        transactions.splice(index, 1);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderTransactions();
        updateFinanceCards();
        renderRevenueExpenseChart();
        renderCourseRevenueChart();
        renderExpenseBreakdownChart();
      }
      break;
  }
}

// Render transactions to table
function renderTransactions() {
  tableBody.innerHTML = '';

  const start = (currentPage - 1) * perPage;
  const pageData = transactions.slice(start, start + perPage);

  pageData.forEach((tx, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${tx.id}</td>
      <td>${tx.date}</td>
      <td>${tx.description}</td>
      <td>${tx.category}</td>
      <td>${formatCurrency(tx.amount)}</td>
      <td><span class="badge ${tx.type.toLowerCase()}">${tx.type}</span></td>
      <td><span class="badge ${tx.status.toLowerCase()}">${tx.status}</span></td>
      <td>
        <button class="icon-btn" data-action="visibility" data-index="${i}"><span class="material-icons-outlined">visibility</span></button>
        <button class="icon-btn" data-action="edit" data-index="${i}"><span class="material-icons-outlined">edit</span></button>
        <button class="icon-btn" data-action="delete" data-index="${i}"><span class="material-icons-outlined">delete</span></button>
      </td>`;
    tableBody.appendChild(row);
  });

  // Attach action handlers
  document.querySelectorAll('.icon-btn').forEach(btn => {
    const action = btn.dataset.action;
    const index = start + parseInt(btn.dataset.index);
    btn.onclick = () => handleAction(action, index);
  });
}

// Finance overview cards
function updateFinanceCards() {
  let revenue = 0, expenses = 0, pending = 0;
  transactions.forEach(tx => {
    if (tx.status === 'Pending') pending += tx.amount;
    if (tx.type === 'Income') revenue += tx.amount;
    else expenses += tx.amount;
  });

  financeCards.revenue.textContent = formatCurrency(revenue);
  financeCards.expenses.textContent = formatCurrency(expenses);
  financeCards.profit.textContent = formatCurrency(revenue - expenses);
  financeCards.pending.textContent = formatCurrency(pending);
}

function renderRevenueExpenseChart() {
  const revenueData = Array(12).fill(0);
  const expenseData = Array(12).fill(0);

  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const month = date.getMonth(); // 0-based month index
    if (tx.type === 'Income') revenueData[month] += tx.amount;
    else if (tx.type === 'Expense') expenseData[month] += tx.amount;
  });

  if (revenueExpenseChart) revenueExpenseChart.destroy();

  const ctx = document.getElementById('revenue-expense-chart')?.getContext('2d');
  if (!ctx) return;

  revenueExpenseChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
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
    }
  });
}

function renderCourseRevenueChart() {
  const courseMap = {};

  transactions.forEach(tx => {
    if (tx.type === 'Income') {
      courseMap[tx.category] = (courseMap[tx.category] || 0) + tx.amount;
    }
  });

  const labels = Object.keys(courseMap);
  const values = Object.values(courseMap);

  if (courseRevenueChart) courseRevenueChart.destroy();

  const ctx = document.getElementById('course-revenue-chart')?.getContext('2d');
  if (!ctx) return;

  courseRevenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Revenue by Course',
        data: values,
        backgroundColor: '#2196F3'
      }]
    }
  });
}

function renderExpenseBreakdownChart() {
  const expenseMap = {};

  transactions.forEach(tx => {
    if (tx.type === 'Expense') {
      expenseMap[tx.category] = (expenseMap[tx.category] || 0) + tx.amount;
    }
  });

  const labels = Object.keys(expenseMap);
  const values = Object.values(expenseMap);
  const colors = ['#FF9800', '#3F51B5', '#00BCD4', '#E91E63', '#8BC34A', '#9C27B0'];

  if (expenseBreakdownChart) expenseBreakdownChart.destroy();

  const ctx = document.getElementById('expense-breakdown-chart')?.getContext('2d');
  if (!ctx) return;

  expenseBreakdownChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length)
      }]
    }
  });
}




// Pagination
function setupPagination() {
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  const pageCount = Math.ceil(transactions.length / perPage);
  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderTransactions();
      setupPagination();
    };
    pagination.appendChild(btn);
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.primary-btn').addEventListener('click', () => openModal());
  document.getElementById("exportBtn").addEventListener("click", exportToCSV);
  renderTransactions();
  updateFinanceCards();
  setupPagination();

  // 👇 Call chart renderers here
  renderRevenueExpenseChart();
  renderCourseRevenueChart();
  renderExpenseBreakdownChart();
});
function exportToCSV() {
  if (transactions.length === 0) {
    alert("No transactions to export!");
    return;
  }

  const headers = ['ID', 'Date', 'Description', 'Category', 'Amount', 'Type', 'Status'];
  const rows = transactions.map(tx => [
    tx.id,
    tx.date,
    tx.description,
    tx.category,
    tx.amount,
    tx.type,
    tx.status
  ]);

  const csvContent = [headers, ...rows]
    .map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "transactions.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
// document.addEventListener('DOMContentLoaded', () => {
//   // Revenue vs Expenses Chart
//   const revenueCtx = document.getElementById('revenue-expense-chart')?.getContext('2d');
//   if (revenueCtx) {
//     new Chart(revenueCtx, {
//       type: 'line',
//       data: {
//         labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
//         datasets: [
//           {
//             label: 'Revenue',
//             data: [50000, 70000, 65000, 80000, 90000],
//             borderColor: '#4CAF50',
//             fill: false,
//             tension: 0.4
//           },
//           {
//             label: 'Expenses',
//             data: [30000, 35000, 40000, 45000, 50000],
//             borderColor: '#F44336',
//             fill: false,
//             tension: 0.4
//           }
//         ]
//       }
//     });
//   }

//   // Revenue by Course Chart
//   const courseCtx = document.getElementById('course-revenue-chart')?.getContext('2d');
//   if (courseCtx) {
//     new Chart(courseCtx, {
//       type: 'bar',
//       data: {
//         labels: ['Web Dev', 'Data Science', 'UI/UX', 'Python'],
//         datasets: [{
//           label: 'Revenue',
//           data: [30000, 40000, 25000, 20000],
//           backgroundColor: '#2196F3'
//         }]
//       }
//     });
//   }

//   // Expense Breakdown Chart
//   const expenseCtx = document.getElementById('expense-breakdown-chart')?.getContext('2d');
//   if (expenseCtx) {
//     new Chart(expenseCtx, {
//       type: 'pie',
//       data: {
//         labels: ['Salaries', 'Marketing', 'Supplies', 'Utilities'],
//         datasets: [{
//           data: [40000, 15000, 8000, 7000],
//           backgroundColor: ['#FF9800', '#3F51B5', '#00BCD4', '#E91E63']
//         }]
//       }
//     });
//   }
// });

