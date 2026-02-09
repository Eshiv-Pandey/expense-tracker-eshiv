// Global Variables
let entries = [];
let editingId = null;

// DOM Elements
const quickAddBtn = document.getElementById('quickAddBtn');
const addModal = document.getElementById('addModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const expenseForm = document.getElementById('expenseForm');
const cancelBtn = document.getElementById('cancelBtn');
const submitBtn = document.getElementById('submitBtn');
const modalTitle = document.getElementById('modalTitle');

const transactionsList = document.getElementById('transactionsList');
const noEntries = document.getElementById('noEntries');

const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const currentBalanceEl = document.getElementById('currentBalance');

const filterType = document.getElementById('filterType');
const filterCategory = document.getElementById('filterCategory');
const searchDescription = document.getElementById('searchDescription');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const resetFiltersBtn = document.getElementById('resetFilters');

// Tab Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    setTodayDate();
    setupEventListeners();
    renderTransactions();
    updateSummary();
    renderCharts();
    loadTheme();
});

// Setup Event Listeners
function setupEventListeners() {
    quickAddBtn.addEventListener('click', () => openModal());
    modalOverlay.addEventListener('click', () => closeModalFunc());
    closeModal.addEventListener('click', () => closeModalFunc());
    cancelBtn.addEventListener('click', () => closeModalFunc());
    expenseForm.addEventListener('submit', handleFormSubmit);
    
    filterType.addEventListener('change', applyFilters);
    filterCategory.addEventListener('change', applyFilters);
    searchDescription.addEventListener('input', applyFilters);
    startDate.addEventListener('change', applyFilters);
    endDate.addEventListener('change', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
}

// Modal Functions
function openModal(entry = null) {
    addModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (entry) {
        editingId = entry.id;
        modalTitle.textContent = 'Edit Transaction';
        submitBtn.innerHTML = `
            <span>Update Transaction</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        `;
        
        // Fill form
        document.getElementById('amount').value = entry.amount;
        document.querySelector(`input[name="type"][value="${entry.type}"]`).checked = true;
        document.getElementById('category').value = entry.category;
        document.getElementById('date').value = entry.date;
        document.getElementById('description').value = entry.description || '';
    } else {
        editingId = null;
        modalTitle.textContent = 'Add New Transaction';
        submitBtn.innerHTML = `
            <span>Add Transaction</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        `;
    }
}

function closeModalFunc() {
    addModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    expenseForm.reset();
    setTodayDate();
    editingId = null;
}

// Set today's date
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Handle Form Submit
function handleFormSubmit(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.querySelector('input[name="type"]:checked').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    
    if (editingId !== null) {
        updateEntry(editingId, { amount, type, category, date, description });
    } else {
        addEntry({ amount, type, category, date, description });
    }
    
    closeModalFunc();
}

// Add Entry
function addEntry(entry) {
    const newEntry = {
        id: Date.now(),
        ...entry,
        timestamp: new Date().toISOString()
    };
    
    entries.push(newEntry);
    saveEntries();
    renderTransactions();
    updateSummary();
    renderCharts();
}

// Update Entry
function updateEntry(id, updatedData) {
    const index = entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
        entries[index] = { ...entries[index], ...updatedData };
        saveEntries();
        renderTransactions();
        updateSummary();
        renderCharts();
    }
}

// Edit Entry
function editEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (entry) {
        openModal(entry);
    }
}

// Delete Entry
function deleteEntry(id) {
    if (confirm('Delete this transaction?')) {
        entries = entries.filter(entry => entry.id !== id);
        saveEntries();
        renderTransactions();
        updateSummary();
        renderCharts();
    }
}

// Render Transactions
function renderTransactions() {
    const filteredEntries = getFilteredEntries();
    
    if (filteredEntries.length === 0) {
        transactionsList.innerHTML = '';
        noEntries.classList.add('show');
        return;
    }
    
    noEntries.classList.remove('show');
    
    transactionsList.innerHTML = filteredEntries.map(entry => {
        const categoryEmojis = {
            salary: '💼', freelance: '💻', investment: '📈',
            food: '🍔', travel: '✈️', shopping: '🛍️',
            bills: '📱', healthcare: '🏥', entertainment: '🎬',
            education: '📚', other: '📌'
        };
        
        return `
            <div class="transaction-item">
                <div class="transaction-icon ${entry.type}">
                    ${categoryEmojis[entry.category] || '📌'}
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${capitalizeFirst(entry.category)}</div>
                    <div class="transaction-meta">
                        <span>${formatDate(entry.date)}</span>
                        ${entry.description ? `<span>• ${entry.description}</span>` : ''}
                    </div>
                </div>
                <div class="transaction-amount ${entry.type}">
                    ${entry.type === 'income' ? '+' : '-'}₹${entry.amount.toFixed(2)}
                </div>
                <div class="transaction-actions">
                    <button class="action-btn edit" onclick="editEntry(${entry.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteEntry(${entry.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Get Filtered Entries
function getFilteredEntries() {
    let filtered = [...entries];
    
    if (filterType.value !== 'all') {
        filtered = filtered.filter(entry => entry.type === filterType.value);
    }
    
    if (filterCategory.value !== 'all') {
        filtered = filtered.filter(entry => entry.category === filterCategory.value);
    }
    
    if (searchDescription.value.trim()) {
        const searchTerm = searchDescription.value.toLowerCase().trim();
        filtered = filtered.filter(entry => 
            (entry.description || '').toLowerCase().includes(searchTerm) ||
            entry.category.toLowerCase().includes(searchTerm)
        );
    }
    
    if (startDate.value) {
        filtered = filtered.filter(entry => entry.date >= startDate.value);
    }
    
    if (endDate.value) {
        filtered = filtered.filter(entry => entry.date <= endDate.value);
    }
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return filtered;
}

// Apply Filters
function applyFilters() {
    renderTransactions();
}

// Reset Filters
function resetFilters() {
    filterType.value = 'all';
    filterCategory.value = 'all';
    searchDescription.value = '';
    startDate.value = '';
    endDate.value = '';
    renderTransactions();
}

// Update Summary
function updateSummary() {
    const income = entries
        .filter(entry => entry.type === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0);
    
    const expense = entries
        .filter(entry => entry.type === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);
    
    const balance = income - expense;
    
    animateValue(totalIncomeEl, income);
    animateValue(totalExpenseEl, expense);
    animateValue(currentBalanceEl, balance);
}

// Animate number change
function animateValue(element, value) {
    const formatted = `₹${value.toFixed(2)}`;
    element.textContent = formatted;
    element.style.animation = 'none';
    setTimeout(() => {
        element.style.animation = 'pulse 0.5s ease';
    }, 10);
}

// Tab Switching
function switchTab(tabName) {
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    tabContents.forEach(content => {
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    if (tabName === 'analytics') {
        renderCharts();
    }
}

// Theme Toggle Functions
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Re-render charts with new theme colors
    setTimeout(() => {
        renderCharts();
    }, 100);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
}

// LocalStorage Functions
function saveEntries() {
    localStorage.setItem('expenseEntries', JSON.stringify(entries));
}

function loadEntries() {
    const stored = localStorage.getItem('expenseEntries');
    if (stored) {
        entries = JSON.parse(stored);
    }
}

// Helper Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Chart Functions
function renderCharts() {
    renderPieChart();
    renderBarChart();
}

function renderPieChart() {
    const canvas = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 400;
    canvas.height = 400;
    
    const expensesByCategory = {};
    entries.filter(e => e.type === 'expense').forEach(entry => {
        if (!expensesByCategory[entry.category]) {
            expensesByCategory[entry.category] = 0;
        }
        expensesByCategory[entry.category] += entry.amount;
    });
    
    const categories = Object.keys(expensesByCategory);
    const values = Object.values(expensesByCategory);
    const total = values.reduce((sum, val) => sum + val, 0);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (total === 0) {
        const textColor = document.body.classList.contains('light-mode') ? '#64748b' : '#94a3b8';
        ctx.fillStyle = textColor;
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('No expense data', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 20;
    const radius = 120;
    
    let currentAngle = -Math.PI / 2;
    
    categories.forEach((category, index) => {
        const sliceAngle = (values[index] / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        const strokeColor = document.body.classList.contains('light-mode') ? '#ffffff' : '#1e293b';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        currentAngle += sliceAngle;
    });
    
    const textColor = document.body.classList.contains('light-mode') ? '#0f172a' : '#f1f5f9';
    const legendY = canvas.height - 100;
    categories.forEach((category, index) => {
        const percentage = ((values[index] / total) * 100).toFixed(1);
        const x = (index % 2) * 200 + 20;
        const y = legendY + Math.floor(index / 2) * 22;
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(x, y, 16, 16);
        
        ctx.fillStyle = textColor;
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`${capitalizeFirst(category)}: ${percentage}%`, x + 22, y + 12);
    });
}

function renderBarChart() {
    const canvas = document.getElementById('barChart');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 600;
    canvas.height = 400;
    
    const monthlyData = {};
    
    entries.forEach(entry => {
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        
        if (entry.type === 'income') {
            monthlyData[monthKey].income += entry.amount;
        } else {
            monthlyData[monthKey].expense += entry.amount;
        }
    });
    
    const months = Object.keys(monthlyData).sort().slice(-6);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (months.length === 0) {
        const textColor = document.body.classList.contains('light-mode') ? '#64748b' : '#94a3b8';
        ctx.fillStyle = textColor;
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('No monthly data', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const padding = 60;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    
    const maxValue = Math.max(...months.map(m => Math.max(monthlyData[m].income, monthlyData[m].expense)));
    const barWidth = chartWidth / (months.length * 2.5);
    
    const isLight = document.body.classList.contains('light-mode');
    const axisColor = isLight ? '#475569' : '#334155';
    const textColor = isLight ? '#0f172a' : '#cbd5e1';
    const gridColor = isLight ? '#e2e8f0' : '#334155';
    const mutedColor = isLight ? '#64748b' : '#94a3b8';
    
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    months.forEach((month, index) => {
        const x = padding + (index * (barWidth * 2.5));
        const incomeHeight = (monthlyData[month].income / maxValue) * chartHeight;
        const expenseHeight = (monthlyData[month].expense / maxValue) * chartHeight;
        
        ctx.fillStyle = '#10b981';
        ctx.fillRect(x, canvas.height - padding - incomeHeight, barWidth, incomeHeight);
        
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + barWidth, canvas.height - padding - expenseHeight, barWidth, expenseHeight);
        
        ctx.fillStyle = textColor;
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x + barWidth, canvas.height - padding + 15);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(formatMonthLabel(month), 0, 0);
        ctx.restore();
    });
    
    for (let i = 0; i <= 5; i++) {
        const value = (maxValue / 5) * i;
        const y = canvas.height - padding - (chartHeight / 5) * i;
        
        ctx.fillStyle = mutedColor;
        ctx.font = '11px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(`₹${value.toFixed(0)}`, padding - 10, y + 4);
        
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
}

function formatMonthLabel(monthKey) {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);