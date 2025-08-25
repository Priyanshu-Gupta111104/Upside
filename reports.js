import { initializeCharts } from './charts.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize charts
  initializeCharts();

  // Generate Report Button
  const generateReportBtn = document.querySelector('.generate-report-btn');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
      const dateRange = document.getElementById('date-range').value;
      const reportType = document.getElementById('report-type').value;
      alert(`Generating ${reportType} for ${dateRange}`);
    });
  }

  // Date Range Filter
  const dateRangeSelect = document.getElementById('date-range');
  if (dateRangeSelect) {
    dateRangeSelect.addEventListener('change', () => {
      updateReports();
    });
  }

  // Report Type Filter
  const reportTypeSelect = document.getElementById('report-type');
  if (reportTypeSelect) {
    reportTypeSelect.addEventListener('change', () => {
      updateReports();
    });
  }
});

function updateReports() {
  const dateRange = document.getElementById('date-range').value;
  const reportType = document.getElementById('report-type').value;
  
  // In a real application, this would fetch new data and update the charts
  console.log(`Updating reports for ${reportType} - ${dateRange}`);
}