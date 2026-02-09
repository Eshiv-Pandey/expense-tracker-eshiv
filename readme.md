# Expense Tracker – Mini Dashboard

A simple web-based Expense Tracker built using HTML, CSS, and Vanilla JavaScript.  
The application allows users to add, view, filter, and manage income and expense entries, with full data persistence using browser localStorage.

---

## Live Demo

🔗 Deployed Application: https://expense-tracker-eshiv.vercel.app/

📹 Demo Video (30–60 sec):
- Adding income and expense entries
- Filters in action
- Summary section updating in real time
- Data persistence after page refresh

---

## Features

- Add income and expense entries with:
  - Amount
  - Type (Income / Expense)
  - Category
  - Date
  - Optional description
- View all transactions in a list
- Filter transactions by:
  - Type
  - Category
  - Date range
  - Description search
- Summary dashboard showing:
  - Total Income
  - Total Expense
  - Current Balance
- Data persistence using localStorage
- Responsive and clean UI
- Edit and delete existing entries
- Charts for visual insights (Canvas API)
- Light/Dark theme toggle

---

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Browser APIs:
  - localStorage
  - Canvas API
- Deployment: Vercel

---

## Tools & Resources Used

### Development & Reference
- MDN Web Docs (JavaScript, DOM manipulation, localStorage)
- Stack Overflow (debugging and edge-case handling)
- Browser DevTools for testing and debugging

### AI Tools
- Claude
- ChatGPT

AI tools were used as **development assistants** to:
- Generate initial boilerplate
- Explore alternative implementations
- Speed up debugging and refactoring under a tight deadline

---

## Challenges Faced & How I Resolved Them

### 1. Handling Add vs Edit Using the Same Form
Managing add and edit functionality with a single form initially caused state conflicts.

**Resolution:**  
Introduced an `editingId` state variable to track whether the form is in add or edit mode.  
This allowed clean reuse of UI and logic without duplication.

---

### 2. Date Formatting and Filtering Issues
Date comparisons were inconsistent due to formatting differences.

**Resolution:**  
Standardized all dates to ISO format (`YYYY-MM-DD`), ensuring compatibility with HTML date inputs and reliable filtering logic.

---

### 3. Data Loss on Page Refresh
Earlier versions lost data on reload.

**Resolution:**  
Moved application state persistence to localStorage and ensured data is loaded on `DOMContentLoaded` before rendering the UI.

---

### 4. UI State Reset Problems
Closing the modal during editing sometimes left stale data in the form.

**Resolution:**  
Explicitly reset form fields, editing state, and scroll behavior whenever the modal is closed.

---

### 5. Keeping UI and Data in Sync
Manually updating individual UI elements led to inconsistencies.

**Resolution:**  
Adopted a state-driven approach where the UI is always re-rendered from the central `entries` array after any state change.

---

## Note on AI Usage

AI tools such as Claude and ChatGPT were used as productivity aids during development under a strict deadline.  
They assisted with:
- Initial code structure
- Syntax reference
- Exploring implementation approaches

All code was reviewed, tested, modified, and integrated by me.  
I focused on understanding the complete codebase, refining the UI/UX, and ensuring all assignment requirements were met.

---

## What I Learned

- Managing application state without using frameworks
- Structuring JavaScript code for maintainability
- Handling UI state, filters, and persistence together
- Using browser APIs effectively
- Using AI tools responsibly as part of the development workflow


