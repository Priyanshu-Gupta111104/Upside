// Main JavaScript file for shared functionality

// DOM Element References
document.addEventListener('DOMContentLoaded', () => {
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const menuTrigger = document.getElementById('menu-trigger');
const closeSidebar = document.getElementById('close-sidebar');
const logoutBtn = document.getElementById('logout-btn');

// Show sidebar on menu icon click
  if (menuTrigger) {
    menuTrigger.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent bubbling to document
      sidebar.classList.add('active');
    });
  }

  // Close sidebar on close (X) icon
  if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
      sidebar.classList.remove('active');
    });
  }

  // Close sidebar when clicking outside
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) &&
        e.target !== menuTrigger) {
      sidebar.classList.remove('active');
    }
  });
});
  

// Initialize Current Date
function initializeDate() {
  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
  }
}


  // Initialize date display
  initializeDate();
  

  
  
  // Logout button event
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('You have been logged out successfully.');
      // In a real app, this would handle the logout functionality
      // window.location.href = 'login.html';
    });
  }
  

// Common Utility Functions

// Format Currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format Date
export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

// Generate Random Color
export function getRandomColor(opacity = 1) {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Truncate text with ellipsis
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}