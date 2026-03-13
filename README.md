Objective
Build a simplified, functional Kanban-style task board. This assessment evaluates your ability to manage complex local state, implement seamless interactive UI, and ensure data persistence — without reliance on external APIs.
 
1.	Functional Requirements
Column Layout
Implement three fixed columns: To Do, In Progress, and Done.
Task Management
Users must be able to:
Create a new task with a Title and Description.
Delete an existing task.
Move a task between columns via a Move button or Drag-and-Drop.
Data Persistence
All tasks must persist in localStorage so that board state is retained after a page refresh.
Empty States
Display a placeholder message (e.g., "No tasks in this column") when a column contains no tasks.
 
2.	Technical Constraints
Tech Stack: React 18+ with a utility-first CSS framework (Tailwind CSS preferred).
State Management: useReducer or a lightweight store (Zustand / Context API). Demonstrate clear state transitions between columns.
Dependencies: Use native HTML/CSS for core layout. A drag-and-drop library ( dnd-kit , react-beautifuldnd ) is optional; a manual Move button is acceptable within the time constraint.
3.	Evaluation Criteria
Criterion	What We Assess
State Integrity	Moving a task between columns happens instantly and without visual glitches.
Data Structure	How the task list is stored internally (object/map vs. flat array; performance implications).
UI Polish	Professional appearance — consistent spacing, hover states, accessible interaction patterns.
Edge Cases	Handling of blank task submissions, empty columns, and rapid user interactions.
